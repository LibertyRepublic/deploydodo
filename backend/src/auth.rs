use axum::{
    extract::{Request, State},
    http::{HeaderMap, StatusCode},
    middleware::Next,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;

use crate::{dependencies::Dependencies, error::AppError};

#[derive(Clone, Debug)]
pub struct AuthUser {
    pub user_id: i64,
}

pub async fn require_auth(
    State(deps): State<Dependencies>,
    headers: HeaderMap,
    mut request: Request,
    next: Next,
) -> Result<Response, Response> {
    let token = headers
        .get("Authorization")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer "));

    let user_id = match token {
        Some(t) => match deps.session_service.resolve_session(t).await {
            Ok(Some(id)) => id,
            Ok(None) => {
                return Ok(
                    (StatusCode::UNAUTHORIZED, Json(json!({ "error": "unauthorized" })))
                        .into_response(),
                );
            }
            Err(e) => {
                tracing::error!(%e, "session resolution failed");
                return Ok(
                    (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        Json(json!({ "error": "Internal server error" })),
                    )
                        .into_response(),
                );
            }
        },
        None => {
            return Ok(
                (StatusCode::UNAUTHORIZED, Json(json!({ "error": "unauthorized" })))
                    .into_response(),
            );
        }
    };

    request.extensions_mut().insert(AuthUser { user_id });

    Ok(next.run(request).await)
}

impl axum::extract::FromRequestParts<Dependencies> for AuthUser {
    type Rejection = AppError;

    async fn from_request_parts(
        parts: &mut axum::http::request::Parts,
        _state: &Dependencies,
    ) -> Result<Self, Self::Rejection> {
        parts
            .extensions
            .get::<AuthUser>()
            .cloned()
            .ok_or(AppError::Unauthorized)
    }
}
