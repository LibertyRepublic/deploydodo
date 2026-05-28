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

pub struct DockerStatus {
    pub is_installed: bool,
    pub is_running: bool,
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
        timeout: Option<Duration>,
    ) -> Result<Self, SshError> {
        session_init(hostname, port, username, auth, timeout).await
    }

    /// Cleanly closes the connection.
    pub async fn disconnect(&self) -> Result<(), SshError> {
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

    /// Returns `Ok(true)` if the Docker installation came from snap.
    pub async fn is_docker_installed_via_snap(&self) -> Result<bool, SshError> {
        // Primary: snap path in the binary location.
        let which = self.run_command("which docker").await?;
        if which.exit_code == 0 && which.stdout.contains("/snap/") {
            return Ok(true);
        }

        // Secondary: ask snap itself (handles symlinks that don't expose the snap path).
        let snap = self.run_command("snap list docker").await?;
        Ok(snap.exit_code == 0)
    }

    /// Returns `Ok(true)` if Docker is installed and the daemon is reachable.
    /// Returns `Ok(false)` if the binary is missing or the daemon is not running.
    pub async fn check_docker(&self) -> Result<DockerStatus, SshError> {
        // Guard: is the binary present?
        let which = self.run_command("command -v docker").await?;
        if which.exit_code != 0 {
            return Ok(DockerStatus {
                is_installed: false,
                is_running: false,
            });
        }

        // Full check: is the daemon up and responding?
        let info = self.run_command("docker info").await?;
        Ok(DockerStatus {
            is_installed: true,
            is_running: info.exit_code == 0,
        })
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
    timeout: Option<Duration>,
) -> Result<SshSession, SshError> {
    let config = Arc::new(client::Config {
        inactivity_timeout: timeout.or(Some(Duration::from_secs(10))),
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
