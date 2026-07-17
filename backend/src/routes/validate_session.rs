use axum::Json;
use serde::Serialize;
use utoipa::ToSchema;

use crate::{
    error::AppResult,
    extractors::OptionalAuth,
};

#[derive(Serialize, ToSchema)]
pub struct ValidateSessionResponse {
    pub valid: bool,
}

#[utoipa::path(
    get,
    path = "/api/auth/validate",
    responses(
        (status = 200, description = "Session is valid", body = ValidateSessionResponse),
    ),
    tag = "auth"
)]
pub async fn validate_session(
    OptionalAuth(user): OptionalAuth,
) -> AppResult<Json<ValidateSessionResponse>> {
    Ok(Json(ValidateSessionResponse {
        valid: user.is_some(),
    }))
}
