use std::sync::Arc;
use std::time::Duration;

use russh::client;
use russh::keys::ssh_key::PublicKey;
use russh::keys::{decode_secret_key, PrivateKeyWithHashAlg};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum SshError {
    #[error("ssh error: {0}")]
    Ssh(#[from] russh::Error),
    #[error("key error: {0}")]
    Key(#[from] russh::keys::Error),
    #[error("authentication failed")]
    AuthFailed,
}

pub enum SshAuth<'a> {
    Password(&'a str),
    Key {
        private_key: &'a str,
        passphrase: Option<&'a str>,
    },
}

pub struct Handler;

impl client::Handler for Handler {
    type Error = russh::Error;

    async fn check_server_key(
        &mut self,
        _server_public_key: &PublicKey,
    ) -> Result<bool, Self::Error> {
        Ok(true)
    }
}

pub struct SshSession {
    pub handle: client::Handle<Handler>,
}

impl SshSession {
    fn new(handle: client::Handle<Handler>) -> Self {
        Self { handle }
    }

    /// Connects and authenticates, returning a live session.
    pub async fn connect(
        hostname: &str,
        port: u16,
        username: &str,
        auth: SshAuth<'_>,
    ) -> Result<Self, SshError> {
        session_init(hostname, port, username, auth).await
    }

    /// Cleanly closes the connection.
    pub async fn disconnect(self) -> Result<(), SshError> {
        self.handle
            .disconnect(
                russh::Disconnect::ByApplication,
                "SSH connection closed",
                "English",
            )
            .await
            .map_err(SshError::Ssh)
    }

    pub async fn check_root_access(&self) -> Result<bool, SshError> {
        // First check: is the user already root?
        let id_output = self.run_command("id -u").await?;

        if id_output.exit_code == 0 && id_output.stdout.trim() == "0" {
            return Ok(true);
        }

        // Second check: passwordless sudo.
        let sudo_output = self.run_command("sudo -n true").await?;

        Ok(sudo_output.exit_code == 0)
    }

    pub async fn run_command(&self, command: &str) -> Result<CommandOutput, SshError> {
        let mut channel = self.handle.channel_open_session().await?;
        channel.exec(true, command).await?;

        let mut stdout = String::new();
        let mut exit_code = 0u32;

        loop {
            let Some(msg) = channel.wait().await else {
                break;
            };
            match msg {
                russh::ChannelMsg::Data { data } => {
                    stdout.push_str(&String::from_utf8_lossy(&data));
                }
                russh::ChannelMsg::ExitStatus { exit_status } => {
                    exit_code = exit_status;
                }
                _ => {}
            }
        }
        Ok(CommandOutput { stdout, exit_code })
    }
}

pub struct CommandOutput {
    pub stdout: String,
    pub exit_code: u32,
}

async fn session_init(
    hostname: &str,
    port: u16,
    username: &str,
    auth: SshAuth<'_>,
) -> Result<SshSession, SshError> {
    let config = Arc::new(client::Config {
        inactivity_timeout: Some(Duration::from_secs(10)),
        ..<_>::default()
    });

    let mut handle = client::connect(config, (hostname, port), Handler).await?;

    let authenticated = match auth {
        SshAuth::Password(password) => handle.authenticate_password(username, password).await?,
        SshAuth::Key {
            private_key,
            passphrase,
        } => {
            let key = decode_secret_key(private_key, passphrase)?;
            let hash = handle.best_supported_rsa_hash().await?.flatten();
            handle
                .authenticate_publickey(username, PrivateKeyWithHashAlg::new(Arc::new(key), hash))
                .await?
        }
    };

    if !authenticated.success() {
        return Err(SshError::AuthFailed);
    }

    Ok(SshSession::new(handle))
}
