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
        port: u16,
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
    pub port: Option<u16>,
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

    let server = match request {
        CreateServerRequest::Local { name, hostname } => {
            handle_create_local_server(&name, &hostname, deps).await?
        }
        CreateServerRequest::Remote {
            name,
            hostname,
            port,
            auth,
        } => handle_create_remote_server(&name, &hostname, port, auth, deps).await?,
    };

    return Ok((StatusCode::CREATED, server));
}

async fn handle_create_local_server(
    name: &str,
    hostname: &str,
    deps: Dependencies,
) -> Result<Json<CreateServerResponse>, AppError> {
    let count = deps.server_service.count_local_servers().await?;
    if count > 0 {
        return Err(AppError::LocalServerAlreadyExists);
    }

    let server = deps
        .server_service
        .create_local_server(&name, &hostname)
        .await?;

    tracing::info!(id = %server.id, "local server created");

    Ok(Json(CreateServerResponse {
        id: server.id,
        name: server.name,
        server_type: server.server_type,
        hostname: server.hostname,
        port: server.ssh_port,
    }))
}

async fn handle_create_remote_server(
    name: &str,
    hostname: &str,
    port: u16,
    auth: SshAuthRequest,
    deps: Dependencies,
) -> Result<Json<CreateServerResponse>, AppError> {
    let remote_auth = match &auth {
        SshAuthRequest::Password { username, password } => {
            RemoteAuth::Password { username, password }
        }
        SshAuthRequest::KeyPair {
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

    Ok(Json(CreateServerResponse {
        id: server.id,
        name: server.name,
        server_type: server.server_type,
        hostname: server.hostname,
        port: server.ssh_port,
    }))
}

// fn progress(msg: &str) -> Result<Event, Infallible> {
//     Ok(Event::default()
//         .event("progress")
//         .data(json!({ "message": msg }).to_string()))
// }

// fn error_event(msg: String) -> Result<Event, Infallible> {
//     Ok(Event::default()
//         .event("error")
//         .data(json!({ "message": msg }).to_string()))
// }

// #[utoipa::path(
//     post,
//     path = "/api/setup/server",
//     request_body = CreateServerRequest,
//     responses(
//         (status = 200, description = "SSE stream of setup progress"),
//         (status = 422, description = "Validation error"),
//     ),
//     tag = "setup"
// )]
// pub async fn create_server(
//     State(deps): State<Dependencies>,
//     Json(request): Json<CreateServerRequest>,
// ) -> Sse<impl futures_core::Stream<Item = Result<Event, Infallible>>> {
//     let s = stream! {
//         if let Err(e) = request.validate() {
//             yield error_event(e.to_string());
//             return;
//         }

//         match request {
//             CreateServerRequest::Local { name, hostname } => {
//                 yield progress("Creating server...");

//                 let count = match deps.server_service.count_local_servers().await {
//                     Ok(c) => c,
//                     Err(e) => { yield error_event(e.to_string()); return; }
//                 };
//                 if count > 0 {
//                     yield error_event("A local server already exists".into());
//                     return;
//                 }

//                 let server = match deps.server_service.create_local_server(&name, &hostname).await {
//                     Ok(s) => s,
//                     Err(e) => { yield error_event(e.to_string()); return; }
//                 };

//                 tracing::info!(id = %server.id, "local server created");
//                 yield Ok(Event::default().event("complete").data(json!({
//                     "id": server.id,
//                     "name": server.name,
//                     "serverType": "local",
//                     "hostname": server.hostname,
//                     "port": null,
//                 }).to_string()));
//             }

//             CreateServerRequest::Remote { name, hostname, port, auth } => {
//                 yield progress("Testing SSH connection...");

//                 let (username, secret, is_key) = match &auth {
//                     SshAuthRequest::Password { username, password } =>
//                         (username.clone(), password.clone(), false),
//                     SshAuthRequest::Key { username, private_key, .. } =>
//                         (username.clone(), private_key.clone(), true),
//                 };

//                 if let Err(e) = test_ssh(hostname.clone(), port, username, secret, is_key).await {
//                     yield error_event(format!("SSH connection failed: {e}"));
//                     return;
//                 }

//                 yield progress("Saving credentials...");

//                 let key_name = format!("{name}-key");
//                 let ssh_key = match &auth {
//                     SshAuthRequest::Password { username, password } => {
//                         deps.ssh_service.create_password_auth(&key_name, username, password).await
//                     }
//                     SshAuthRequest::Key { username, private_key, public_key } => {
//                         deps.ssh_service.create_key_auth(&key_name, username, private_key, public_key.as_deref()).await
//                     }
//                 };
//                 let ssh_key = match ssh_key {
//                     Ok(k) => k,
//                     Err(e) => { yield error_event(e.to_string()); return; }
//                 };

//                 yield progress("Creating server record...");

//                 let server = match deps.server_service.create_remote_server_record(&name, &hostname, port, ssh_key.id).await {
//                     Ok(s) => s,
//                     Err(e) => { yield error_event(e.to_string()); return; }
//                 };

//                 tracing::info!(id = %server.id, ssh_key_id = ?server.ssh_key_id, "remote server created");
//                 yield Ok(Event::default().event("complete").data(json!({
//                     "id": server.id,
//                     "name": server.name,
//                     "serverType": "remote",
//                     "hostname": server.hostname,
//                     "port": server.ssh_port,
//                 }).to_string()));
//             }
//         }
//     };

//     Sse::new(s).keep_alive(KeepAlive::default())
// }
