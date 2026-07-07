mod common;

use axum::http::{header, Request, StatusCode};
use axum::body::Body;
use common::{create_test_app, create_user_and_get_token};
use tower::ServiceExt;

#[tokio::test]
async fn list_servers_without_auth_returns_401() {
    let (app, _db) = create_test_app().await;

    let req = Request::builder()
        .uri("/api/servers")
        .body(Body::empty())
        .unwrap();

    let resp = app.oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::UNAUTHORIZED);
}

#[tokio::test]
async fn list_servers_with_auth_returns_200() {
    let (app, db) = create_test_app().await;
    let token = create_user_and_get_token(&db, "admin@test.com", "password").await;

    let req = Request::builder()
        .uri("/api/servers")
        .header(header::AUTHORIZATION, format!("Bearer {}", token))
        .body(Body::empty())
        .unwrap();

    let resp = app.oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
}
