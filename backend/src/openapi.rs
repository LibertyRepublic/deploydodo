use utoipa::OpenApi;

use crate::routes::{create_admin, create_server, health, status, validate_session};
use crate::services::types;

#[derive(OpenApi)]
#[openapi(
    info(
        title = "DeployDodo API",
        version = "0.1.0",
        description = "DeployDodo backend API"
    ),
    paths(
        health::health,
        status::status,
        validate_session::validate_session,
        create_admin::create_admin,
        create_server::create_server,
    ),
    components(schemas(
        health::HealthResponse,
        status::StatusResponse,
        validate_session::ValidateSessionResponse,
        create_admin::CreateAdminRequest,
        create_admin::AdminResponse,
        create_server::CreateServerRequest,
        create_server::CreateServerResponse,
        create_server::SshAuthRequest,
        types::AccountType,
        types::AuthType,
        types::ServerType,
    )),
    tags(
        (name = "health", description = "Health check"),
        (name = "status", description = "Config status"),
        (name = "auth", description = "Authentication"),
        (name = "setup", description = "Initial setup"),
    )
)]
pub struct ApiDoc;
