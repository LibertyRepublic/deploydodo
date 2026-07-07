use async_trait::async_trait;
use std::time::Duration;

use dodosh::{CommandOutput, DockerStatus, SshAuth, SshSession};

use crate::error::AppError;

#[async_trait]
pub trait SshSessionOps: Send + Sync {
    async fn disconnect(&self) -> Result<(), AppError>;
    async fn check_root_access(&self) -> Result<bool, AppError>;
    async fn check_docker(&self) -> Result<DockerStatus, AppError>;
    async fn is_docker_installed_via_snap(&self) -> Result<bool, AppError>;
    async fn run_command(&self, command: &str) -> Result<CommandOutput, AppError>;
}

pub struct RealSshSession {
    session: SshSession,
}

impl RealSshSession {
    pub fn new(session: SshSession) -> Self {
        Self { session }
    }
}

#[async_trait]
impl SshSessionOps for RealSshSession {
    async fn disconnect(&self) -> Result<(), AppError> {
        self.session.disconnect().await.map_err(AppError::Ssh)
    }

    async fn check_root_access(&self) -> Result<bool, AppError> {
        self.session
            .check_root_access()
            .await
            .map_err(AppError::Ssh)
    }

    async fn check_docker(&self) -> Result<DockerStatus, AppError> {
        self.session.check_docker().await.map_err(AppError::Ssh)
    }

    async fn is_docker_installed_via_snap(&self) -> Result<bool, AppError> {
        self.session
            .is_docker_installed_via_snap()
            .await
            .map_err(AppError::Ssh)
    }

    async fn run_command(&self, command: &str) -> Result<CommandOutput, AppError> {
        self.session.run_command(command).await.map_err(AppError::Ssh)
    }
}

#[async_trait]
pub trait SshConnector: Send + Sync {
    async fn connect(
        &self,
        hostname: &str,
        port: u16,
        username: &str,
        password: Option<&str>,
        private_key: Option<&str>,
    ) -> Result<Box<dyn SshSessionOps>, AppError>;
}

pub struct RealSshConnector;

#[async_trait]
impl SshConnector for RealSshConnector {
    async fn connect(
        &self,
        hostname: &str,
        port: u16,
        username: &str,
        password: Option<&str>,
        private_key: Option<&str>,
    ) -> Result<Box<dyn SshSessionOps>, AppError> {
        let auth = match (password, private_key) {
            (Some(pwd), _) => SshAuth::Password(pwd),
            (_, Some(key)) => SshAuth::Key {
                private_key: key,
                passphrase: None,
            },
            _ => {
                return Err(AppError::Validation(
                    "Either password or private_key required".into(),
                ))
            }
        };

        let session = SshSession::connect(
            hostname,
            port,
            username,
            auth,
            Some(Duration::from_secs(60)),
        )
        .await
        .map_err(|e| {
            AppError::RemoteDockerConnect(format!("SSH connection failed: {e}"))
        })?;

        Ok(Box::new(RealSshSession::new(session)))
    }
}

#[cfg(debug_assertions)]
pub mod test_fakes {
    use super::*;
    use std::sync::Mutex;

    pub struct FakeSshSession {
        pub root_access: bool,
        pub docker_installed: bool,
        pub docker_running: bool,
        pub docker_via_snap: bool,
        pub command_outputs: std::sync::Arc<std::sync::Mutex<Vec<(String, CommandOutput)>>>,
    }

    impl Clone for FakeSshSession {
        fn clone(&self) -> Self {
            Self {
                root_access: self.root_access,
                docker_installed: self.docker_installed,
                docker_running: self.docker_running,
                docker_via_snap: self.docker_via_snap,
                command_outputs: self.command_outputs.clone(),
            }
        }
    }

    impl FakeSshSession {
        pub fn new_success() -> Self {
            Self {
                root_access: true,
                docker_installed: true,
                docker_running: true,
                docker_via_snap: false,
                command_outputs: std::sync::Arc::new(Mutex::new(Vec::new())),
            }
        }

        pub fn new_no_root() -> Self {
            Self {
                root_access: false,
                ..Self::new_success()
            }
        }

        pub fn new_no_docker() -> Self {
            Self {
                root_access: true,
                docker_installed: false,
                docker_running: false,
                docker_via_snap: false,
                command_outputs: std::sync::Arc::new(Mutex::new(Vec::new())),
            }
        }
    }

    #[async_trait]
    impl SshSessionOps for FakeSshSession {
        async fn disconnect(&self) -> Result<(), AppError> {
            Ok(())
        }

        async fn check_root_access(&self) -> Result<bool, AppError> {
            Ok(self.root_access)
        }

        async fn check_docker(&self) -> Result<DockerStatus, AppError> {
            Ok(DockerStatus {
                is_installed: self.docker_installed,
                is_running: self.docker_running,
            })
        }

        async fn is_docker_installed_via_snap(&self) -> Result<bool, AppError> {
            Ok(self.docker_via_snap)
        }

        async fn run_command(&self, command: &str) -> Result<CommandOutput, AppError> {
            let outputs = self.command_outputs.lock().unwrap();
            if let Some((_, output)) = outputs.iter().find(|(cmd, _)| cmd == command) {
                Ok(CommandOutput {
                    stdout: output.stdout.clone(),
                    exit_code: output.exit_code,
                })
            } else {
                Ok(CommandOutput {
                    stdout: String::new(),
                    exit_code: 0,
                })
            }
        }
    }

    pub struct FakeSshConnector {
        session: std::sync::Arc<FakeSshSession>,
    }

    impl FakeSshConnector {
        pub fn new(session: FakeSshSession) -> Self {
            Self {
                session: std::sync::Arc::new(session),
            }
        }

        pub fn session(&self) -> &FakeSshSession {
            &self.session
        }
    }

    #[async_trait]
    impl SshConnector for FakeSshConnector {
        async fn connect(
            &self,
            _hostname: &str,
            _port: u16,
            _username: &str,
            _password: Option<&str>,
            _private_key: Option<&str>,
        ) -> Result<Box<dyn SshSessionOps>, AppError> {
            Ok(Box::new((*self.session).clone()))
        }
    }
}
