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

struct Handler;

impl client::Handler for Handler {
    type Error = russh::Error;

    async fn check_server_key(
        &mut self,
        _server_public_key: &PublicKey,
    ) -> Result<bool, Self::Error> {
        Ok(true)
    }
}

/// Attempts to connect and authenticate. Returns `Ok(())` on success.
pub async fn test_connection(
    hostname: &str,
    port: u16,
    username: &str,
    auth: SshAuth<'_>,
) -> Result<(), SshError> {
    let config = Arc::new(client::Config {
        inactivity_timeout: Some(Duration::from_secs(10)),
        ..<_>::default()
    });

    let mut session = client::connect(config, (hostname, port), Handler).await?;

    let authenticated = match auth {
        SshAuth::Password(password) => session.authenticate_password(username, password).await?,
        SshAuth::Key {
            private_key,
            passphrase,
        } => {
            let key = decode_secret_key(private_key, passphrase)?;
            let hash = session.best_supported_rsa_hash().await?.flatten();
            session
                .authenticate_publickey(username, PrivateKeyWithHashAlg::new(Arc::new(key), hash))
                .await?
        }
    };

    if !authenticated.success() {
        return Err(SshError::AuthFailed);
    }

    session
        .disconnect(
            russh::Disconnect::ByApplication,
            "SSH connection closed",
            "English",
        )
        .await?;

    Ok(())
}
