use axum::{extract::State, http::StatusCode, Json};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

use crate::dependencies::Dependencies;
use crate::error::AppError;
use crate::services::types;
use crate::services::types::RemoteAuth;

#[derive(Deserialize, ToSchema)]
#[serde(tag = "authType", rename_all = "lowercase")]
pub enum SshAuthRequest {
    Password {
        username: String,
        password: String,
    },
    Key {
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
            SshAuthRequest::Key {
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
}

#[derive(Deserialize, ToSchema)]
#[serde(tag = "type", rename_all = "lowercase")]
pub enum CreateServerRequest {
    Local {
        name: String,
        hostname: String,
    },
    Remote {
        name: String,
        hostname: String,
        port: i64,
        auth: SshAuthRequest,
    },
}

impl CreateServerRequest {
    pub fn validate(&self) -> Result<(), AppError> {
        match self {
            CreateServerRequest::Local { name, hostname } => {
                if name.trim().is_empty() {
                    return Err(AppError::Validation("Name is required".into()));
                }
                if hostname.trim().is_empty() {
                    return Err(AppError::Validation("Hostname is required".into()));
                }
            }
            CreateServerRequest::Remote {
                name,
                hostname,
                auth,
                ..
            } => {
                if name.trim().is_empty() {
                    return Err(AppError::Validation("Name is required".into()));
                }
                if hostname.trim().is_empty() {
                    return Err(AppError::Validation("Hostname is required".into()));
                }
                auth.validate()?;
            }
        }
        Ok(())
    }
}

#[derive(Serialize, ToSchema)]
pub struct CreateServerResponse {
    pub id: i64,
    pub name: String,
    #[serde(rename = "serverType")]
    pub server_type: types::ServerType,
    pub hostname: String,
    pub port: Option<i64>,
}

#[utoipa::path(
    post,
    path = "/api/setup/server",
    request_body = CreateServerRequest,
    responses(
        (status = 201, description = "Server created", body = CreateServerResponse),
        (status = 409, description = "A local server already exists"),
        (status = 422, description = "Validation error"),
    ),
    tag = "setup"
)]
pub async fn create_server(
    State(deps): State<Dependencies>,
    Json(request): Json<CreateServerRequest>,
) -> Result<(StatusCode, Json<CreateServerResponse>), AppError> {
    request.validate()?;

    match request {
        CreateServerRequest::Local { name, hostname } => {
            let count = deps.server_service.count_local_servers().await?;
            if count > 0 {
                return Err(AppError::LocalServerAlreadyExists);
            }

            let server = deps
                .server_service
                .create_local_server(&name, &hostname)
                .await?;

            tracing::info!(id = %server.id, "local server created");

            Ok((
                StatusCode::CREATED,
                Json(CreateServerResponse {
                    id: server.id,
                    name: server.name,
                    server_type: server.server_type,
                    hostname: server.hostname,
                    port: server.ssh_port,
                }),
            ))
        }
        CreateServerRequest::Remote {
            name,
            hostname,
            port,
            auth,
        } => {
            let remote_auth = match &auth {
                SshAuthRequest::Password { username, password } => {
                    RemoteAuth::Password { username, password }
                }
                SshAuthRequest::Key {
                    username,
                    private_key,
                    public_key,
                } => RemoteAuth::KeyPair {
                    username,
                    private_key,
                    public_key: public_key.as_deref(),
                },
            };

            let server = deps
                .server_service
                .create_remote_server(&name, &hostname, port, remote_auth)
                .await?;

            tracing::info!(id = %server.id, ssh_key_id = ?server.ssh_key_id, "remote server created");

            Ok((
                StatusCode::CREATED,
                Json(CreateServerResponse {
                    id: server.id,
                    name: server.name,
                    server_type: server.server_type,
                    hostname: server.hostname,
                    port: server.ssh_port,
                }),
            ))
        }
    }
}
