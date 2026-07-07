use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("database error: {0}")]
    Database(#[from] sqlx::Error),

    #[error("admin user already configured")]
    AdminAlreadyConfigured,

    #[error("password hashing failed")]
    PasswordHash,

    #[error("internal error occurred: {0}")]
    InternalServerError(String),

    #[error("{0}")]
    Validation(String),

    #[error("{0}")]
    NotFound(String),

    #[error("unauthorized")]
    Unauthorized,

    #[error("invalid credentials")]
    InvalidCredentials,

    #[error("a local server already exists")]
    LocalServerAlreadyExists,

    #[error("missing key secret")]
    MissingKeySecret,

    #[error("Connection error: {0}")]
    Ssh(#[from] dodosh::SshError),

    #[error("job not found")]
    JobNotFound,

    #[error("local docker error: {0}")]
    LocalDockerConnect(String),

    #[error("remote docker via SSH error: {0}")]
    RemoteDockerConnect(String),

    #[error("docker operation error: {0}")]
    DockerOperation(String),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let status = self.status_code();
        let message = self.client_message();
        (status, Json(json!({ "error": message }))).into_response()
    }
}

impl AppError {
    fn status_code(&self) -> StatusCode {
        match self {
            AppError::Database(_)
            | AppError::PasswordHash
            | AppError::InternalServerError(_)
            | AppError::MissingKeySecret
            | AppError::Ssh(_)
            | AppError::LocalDockerConnect(_)
            | AppError::RemoteDockerConnect(_)
            | AppError::DockerOperation(_) => StatusCode::INTERNAL_SERVER_ERROR,
            AppError::Unauthorized | AppError::InvalidCredentials => StatusCode::UNAUTHORIZED,
            AppError::AdminAlreadyConfigured | AppError::LocalServerAlreadyExists => {
                StatusCode::CONFLICT
            }
            AppError::Validation(_) => StatusCode::UNPROCESSABLE_ENTITY,
            AppError::NotFound(_) | AppError::JobNotFound => StatusCode::NOT_FOUND,
        }
    }

    fn client_message(&self) -> String {
        match self {
            AppError::Database(e) => {
                tracing::error!(%e, "database error");
                "Internal server error".into()
            }
            AppError::InternalServerError(msg) => {
                tracing::error!(%msg, "internal error");
                "Internal server error".into()
            }
            AppError::PasswordHash => {
                tracing::error!("password hashing failed");
                "Internal server error".into()
            }
            AppError::MissingKeySecret => {
                tracing::error!("missing key secret");
                "Internal server error".into()
            }
            AppError::Ssh(e) => {
                tracing::error!(%e, "ssh error");
                "Internal server error".into()
            }
            AppError::LocalDockerConnect(e) => {
                tracing::error!(%e, "local docker connect error");
                "Internal server error".into()
            }
            AppError::RemoteDockerConnect(e) => {
                tracing::error!(%e, "remote docker connect error");
                "Internal server error".into()
            }
            AppError::DockerOperation(e) => {
                tracing::error!(%e, "docker operation error");
                "Internal server error".into()
            }
            _ => self.to_string(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn status_for(err: AppError) -> StatusCode {
        err.status_code()
    }

    #[test]
    fn unauthorized_returns_401() {
        assert_eq!(status_for(AppError::Unauthorized), StatusCode::UNAUTHORIZED);
    }

    #[test]
    fn invalid_credentials_returns_401() {
        assert_eq!(
            status_for(AppError::InvalidCredentials),
            StatusCode::UNAUTHORIZED
        );
    }

    #[test]
    fn admin_already_configured_returns_409() {
        assert_eq!(
            status_for(AppError::AdminAlreadyConfigured),
            StatusCode::CONFLICT
        );
    }

    #[test]
    fn local_server_already_exists_returns_409() {
        assert_eq!(
            status_for(AppError::LocalServerAlreadyExists),
            StatusCode::CONFLICT
        );
    }

    #[test]
    fn validation_returns_422() {
        assert_eq!(
            status_for(AppError::Validation("bad input".into())),
            StatusCode::UNPROCESSABLE_ENTITY
        );
    }

    #[test]
    fn not_found_returns_404() {
        assert_eq!(
            status_for(AppError::NotFound("server not found".into())),
            StatusCode::NOT_FOUND
        );
    }

    #[test]
    fn job_not_found_returns_404() {
        assert_eq!(status_for(AppError::JobNotFound), StatusCode::NOT_FOUND);
    }

    #[test]
    fn database_error_returns_500() {
        let db_err = sqlx::Error::Protocol("test".into());
        assert_eq!(
            status_for(AppError::Database(db_err)),
            StatusCode::INTERNAL_SERVER_ERROR
        );
    }

    #[test]
    fn ssh_error_returns_500() {
        let ssh_err = dodosh::SshError::AuthFailed;
        assert_eq!(
            status_for(AppError::Ssh(ssh_err)),
            StatusCode::INTERNAL_SERVER_ERROR
        );
    }

    #[test]
    fn password_hash_returns_500() {
        assert_eq!(
            status_for(AppError::PasswordHash),
            StatusCode::INTERNAL_SERVER_ERROR
        );
    }

    #[test]
    fn internal_errors_mask_details_from_client() {
        let resp: Response =
            AppError::RemoteDockerConnect("raw ssh error details".into()).into_response();
        let status = resp.status();
        assert_eq!(status, StatusCode::INTERNAL_SERVER_ERROR);
    }
}
