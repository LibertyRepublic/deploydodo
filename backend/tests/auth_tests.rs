mod common;

use axum::http::{header, Request, StatusCode};
use axum::body::Body;
use common::{create_test_app, create_user_and_get_token};
use serde_json::json;
use tower::ServiceExt;

#[tokio::test]
async fn login_with_valid_credentials_returns_200_and_token() {
    let (app, db) = create_test_app().await;

    create_user_and_get_token(&db, "user@test.com", "password123").await;

    let req = Request::builder()
        .uri("/api/auth/login")
        .method("POST")
        .header(header::CONTENT_TYPE, "application/json")
        .body(Body::from(
            json!({"email": "user@test.com", "password": "password123"}).to_string(),
        ))
        .unwrap();

    let resp = app.oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
}

#[tokio::test]
async fn login_with_wrong_password_returns_401() {
    let (app, db) = create_test_app().await;

    create_user_and_get_token(&db, "user@test.com", "correctpass").await;

    let req = Request::builder()
        .uri("/api/auth/login")
        .method("POST")
        .header(header::CONTENT_TYPE, "application/json")
        .body(Body::from(
            json!({"email": "user@test.com", "password": "wrongpass"}).to_string(),
        ))
        .unwrap();

    let resp = app.oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::UNAUTHORIZED);
}

#[tokio::test]
async fn login_with_unknown_email_returns_401() {
    let (app, _db) = create_test_app().await;

    let req = Request::builder()
        .uri("/api/auth/login")
        .method("POST")
        .header(header::CONTENT_TYPE, "application/json")
        .body(Body::from(
            json!({"email": "nobody@test.com", "password": "password123"}).to_string(),
        ))
        .unwrap();

    let resp = app.oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::UNAUTHORIZED);
}

#[tokio::test]
async fn login_with_missing_credentials_returns_422() {
    let (app, _db) = create_test_app().await;

    let req = Request::builder()
        .uri("/api/auth/login")
        .method("POST")
        .header(header::CONTENT_TYPE, "application/json")
        .body(Body::from("{}"))
        .unwrap();

    let resp = app.oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::UNPROCESSABLE_ENTITY);
}

#[tokio::test]
async fn validate_session_with_valid_token_returns_200() {
    let (app, db) = create_test_app().await;

    let token = create_user_and_get_token(&db, "admin@test.com", "pass").await;

    let req = Request::builder()
        .uri("/api/auth/validate")
        .header(header::AUTHORIZATION, format!("Bearer {}", token))
        .body(Body::empty())
        .unwrap();

    let resp = app.oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
}

#[tokio::test]
async fn validate_session_without_token_returns_401() {
    let (app, _db) = create_test_app().await;

    let req = Request::builder()
        .uri("/api/auth/validate")
        .body(Body::empty())
        .unwrap();

    let resp = app.oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::UNAUTHORIZED);
}

#[tokio::test]
async fn validate_session_with_invalid_token_returns_401() {
    let (app, _db) = create_test_app().await;

    let req = Request::builder()
        .uri("/api/auth/validate")
        .header(header::AUTHORIZATION, "Bearer invalid-token-here")
        .body(Body::empty())
        .unwrap();

    let resp = app.oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::UNAUTHORIZED);
}
