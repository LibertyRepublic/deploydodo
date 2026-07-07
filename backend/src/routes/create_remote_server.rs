use axum::{extract::State, http::StatusCode, Json};
use serde::{Deserialize, Serialize};
use serde_json::json;
use utoipa::ToSchema;

use crate::dependencies::Dependencies;
use crate::error::AppError;
use crate::services::docker_setup;
use crate::services::ssh_service::SshKey;
use crate::services::types::JobType;

// ── SSH auth sub-types ────────────────────────────────────────────────────────

#[derive(Deserialize, ToSchema)]
#[serde(tag = "authType", rename_all = "lowercase")]
pub enum SshAuthRequest {
    Password {
        username: String,
        password: String,
    },
    KeyPair {
        username: String,
        #[serde(rename = "privateKey")]
        private_key: String,
        #[serde(rename = "publicKey")]
        public_key: Option<String>,
    },
}

impl SshAuthRequest {
    pub fn validate(&self) -> Result<(), AppError> {
        match self {
            SshAuthRequest::Password { username, password } => {
                if username.trim().is_empty() {
                    return Err(AppError::Validation("Username is required".into()));
                }
                if password.is_empty() {
                    return Err(AppError::Validation("Password is required".into()));
                }
            }
            SshAuthRequest::KeyPair {
                username,
                private_key,
                ..
            } => {
                if username.trim().is_empty() {
                    return Err(AppError::Validation("Username is required".into()));
                }
                if private_key.trim().is_empty() {
                    return Err(AppError::Validation("Private key is required".into()));
                }
            }
        }
        Ok(())
    }

    pub fn get_username(&self) -> &str {
        match self {
            Self::Password { username, .. } | Self::KeyPair { username, .. } => username,
        }
    }

    pub fn password(&self) -> Option<&str> {
        match self {
            Self::Password { password, .. } => Some(password),
            _ => None,
        }
    }

    pub fn private_key(&self) -> Option<&str> {
        match self {
            Self::KeyPair { private_key, .. } => Some(private_key),
            _ => None,
        }
    }
}

// ── Request / Response ────────────────────────────────────────────────────────

#[derive(Deserialize, ToSchema)]
pub struct CreateRemoteServerRequest {
    pub name: String,
    pub hostname: String,
    pub port: u16,
    pub auth: SshAuthRequest,
}

impl CreateRemoteServerRequest {
    fn validate(&self) -> Result<(), AppError> {
        if self.name.trim().is_empty() {
            return Err(AppError::Validation("Name is required".into()));
        }
        if self.hostname.trim().is_empty() {
            return Err(AppError::Validation("Hostname is required".into()));
        }
        self.auth.validate()
    }
}

/// Returned immediately — use `jobId` to stream progress via
/// `GET /api/jobs/:jobId/events`.
#[derive(Serialize, ToSchema)]
pub struct StartJobResponse {
    #[serde(rename = "jobId")]
    pub job_id: String,
}

// ── Checklist step types (used by the frontend progress UI) ──────────────────

#[derive(Debug, Serialize, Deserialize)]
struct ConnectingStep {
    key: StepKey,
    label: String,
    status: CheckListItemStatus,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum CheckListItemStatus {
    Warning,
    Pending,
    Loading,
    Done,
}

#[derive(Debug, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
enum StepKey {
    InitiatingSsh,
    CheckingRoot,
    InstallingDocker,
}

fn create_connecting_remote_steps(active_key: StepKey) -> Vec<ConnectingStep> {
    let mut steps = vec![
        ConnectingStep {
            key: StepKey::InitiatingSsh,
            label: "Initiating SSH connection".into(),
            status: CheckListItemStatus::Pending,
        },
        ConnectingStep {
            key: StepKey::CheckingRoot,
            label: "Checking root permissions".into(),
            status: CheckListItemStatus::Pending,
        },
        ConnectingStep {
            key: StepKey::InstallingDocker,
            label: "Verifying Docker installation".into(),
            status: CheckListItemStatus::Pending,
        },
    ];

    let active_index = steps.iter().position(|s| s.key == active_key);

    if let Some(active_index) = active_index {
        for (i, step) in steps.iter_mut().enumerate() {
            step.status = if i < active_index {
                CheckListItemStatus::Done
            } else if i == active_index {
                CheckListItemStatus::Loading
            } else {
                CheckListItemStatus::Pending
            };
        }
    }

    steps
}

#[utoipa::path(
    post,
    path = "/api/setup/server/remote",
    request_body = CreateRemoteServerRequest,
    responses(
        (status = 202, description = "Job accepted — stream progress via /api/jobs/{jobId}/events", body = StartJobResponse),
        (status = 422, description = "Validation error"),
    ),
    tag = "setup"
)]
pub async fn create_remote_server(
    State(deps): State<Dependencies>,
    Json(request): Json<CreateRemoteServerRequest>,
) -> Result<(StatusCode, Json<StartJobResponse>), AppError> {
    request.validate()?;

    let job_id = deps.job_service.create_job(JobType::CreateServer).await?;

    let job_id_bg = job_id.clone();
    tokio::spawn(async move {
        run_job(job_id_bg, request, deps).await;
    });

    Ok((StatusCode::ACCEPTED, Json(StartJobResponse { job_id })))
}

async fn run_job(job_id: String, request: CreateRemoteServerRequest, deps: Dependencies) {
    match handle_remote(&job_id, &request, &deps).await {
        Ok(()) => {
            let _ = deps.job_service.finish_job(&job_id, "completed").await;
        }
        Err(e) => {
            tracing::error!("{e}");
            let _ = deps
                .job_service
                .emit(&job_id, "error", json!({ "message": e.to_string() }))
                .await;
            let _ = deps.job_service.finish_job(&job_id, "failed").await;
        }
    }
}

async fn handle_remote(
    job_id: &str,
    request: &CreateRemoteServerRequest,
    deps: &Dependencies,
) -> Result<(), AppError> {
    let CreateRemoteServerRequest {
        name,
        hostname,
        port,
        auth,
    } = request;

    deps.job_service
        .emit(
            job_id,
            "progress",
            json!({
                "steps": create_connecting_remote_steps(StepKey::InitiatingSsh),
            }),
        )
        .await?;

    let session = deps
        .ssh_connector
        .connect(
            hostname,
            *port,
            auth.get_username(),
            auth.password(),
            auth.private_key(),
        )
        .await?;

    deps.job_service
        .emit(
            job_id,
            "progress",
            json!({
                "steps": create_connecting_remote_steps(StepKey::CheckingRoot),
            }),
        )
        .await?;

    let is_root = session.check_root_access().await?;
    if !is_root {
        session.disconnect().await?;
        return Err(AppError::Validation("Root access required".to_string()));
    }

    deps.job_service
        .emit(
            job_id,
            "progress",
            json!({
                "steps": create_connecting_remote_steps(StepKey::InstallingDocker),
            }),
        )
        .await?;

    docker_setup::verify_docker_runtime(&*session, true).await?;

    session.disconnect().await?;

    let key_name = format!("{name}-key");
    let ssh_key = create_ssh_key(&key_name, auth, deps).await?;

    let server = deps
        .server_service
        .create_remote_server(name, hostname, *port, ssh_key.id)
        .await?;

    tracing::info!(id = %server.id, ssh_key_id = ?server.ssh_key_id, "remote server created");

    deps.job_service
        .emit(
            job_id,
            "complete",
            json!({
                "id": server.id,
                "name": server.name,
                "serverType": server.server_type,
                "hostname": server.hostname,
                "port": server.ssh_port,
            }),
        )
        .await?;

    Ok(())
}

async fn create_ssh_key(
    key_name: &str,
    auth: &SshAuthRequest,
    deps: &Dependencies,
) -> Result<SshKey, AppError> {
    match auth {
        SshAuthRequest::Password { username, password } => {
            deps.ssh_service
                .create_password_auth(&key_name, username, password)
                .await
        }
        SshAuthRequest::KeyPair {
            username,
            private_key,
            public_key,
        } => {
            deps.ssh_service
                .create_key_auth(&key_name, username, private_key, public_key.as_deref())
                .await
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn password_auth() -> SshAuthRequest {
        SshAuthRequest::Password {
            username: "root".into(),
            password: "secret".into(),
        }
    }

    fn keypair_auth() -> SshAuthRequest {
        SshAuthRequest::KeyPair {
            username: "root".into(),
            private_key: "key-content".into(),
            public_key: None,
        }
    }

    #[test]
    fn ssh_auth_validate_rejects_empty_username_password() {
        let auth = SshAuthRequest::Password {
            username: "  ".into(),
            password: "secret".into(),
        };
        assert!(auth.validate().is_err());
    }

    #[test]
    fn ssh_auth_validate_rejects_empty_password() {
        let auth = SshAuthRequest::Password {
            username: "root".into(),
            password: "".into(),
        };
        assert!(auth.validate().is_err());
    }

    #[test]
    fn ssh_auth_validate_rejects_empty_username_keypair() {
        let auth = SshAuthRequest::KeyPair {
            username: "".into(),
            private_key: "key".into(),
            public_key: None,
        };
        assert!(auth.validate().is_err());
    }

    #[test]
    fn ssh_auth_validate_rejects_empty_private_key() {
        let auth = SshAuthRequest::KeyPair {
            username: "root".into(),
            private_key: "  ".into(),
            public_key: None,
        };
        assert!(auth.validate().is_err());
    }

    #[test]
    fn ssh_auth_validate_accepts_valid_password_auth() {
        assert!(password_auth().validate().is_ok());
    }

    #[test]
    fn ssh_auth_validate_accepts_valid_keypair_auth() {
        assert!(keypair_auth().validate().is_ok());
    }

    #[test]
    fn request_validate_rejects_empty_name() {
        let req = CreateRemoteServerRequest {
            name: "  ".into(),
            hostname: "example.com".into(),
            port: 22,
            auth: password_auth(),
        };
        assert!(req.validate().is_err());
    }

    #[test]
    fn request_validate_rejects_empty_hostname() {
        let req = CreateRemoteServerRequest {
            name: "server1".into(),
            hostname: "".into(),
            port: 22,
            auth: password_auth(),
        };
        assert!(req.validate().is_err());
    }

    #[test]
    fn request_validate_accepts_valid_input() {
        let req = CreateRemoteServerRequest {
            name: "server1".into(),
            hostname: "example.com".into(),
            port: 2222,
            auth: keypair_auth(),
        };
        assert!(req.validate().is_ok());
    }

    #[test]
    fn ssh_auth_password_helper_returns_password() {
        assert_eq!(password_auth().password(), Some("secret"));
    }

    #[test]
    fn ssh_auth_keypair_helper_returns_private_key() {
        assert_eq!(keypair_auth().private_key(), Some("key-content"));
    }

    #[test]
    fn ssh_auth_password_helper_returns_none_password_for_keypair() {
        assert_eq!(keypair_auth().password(), None);
    }

    #[test]
    fn ssh_auth_keypair_helper_returns_none_key_for_password() {
        assert_eq!(password_auth().private_key(), None);
    }
}
