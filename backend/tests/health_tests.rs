mod common;

use axum::http::{Request, StatusCode};
use axum::body::Body;
use common::create_test_app;
use tower::ServiceExt;

#[tokio::test]
async fn health_returns_200() {
    let (app, _db) = create_test_app().await;

    let req = Request::builder()
        .uri("/api/health")
        .body(Body::empty())
        .unwrap();

    let resp = app.oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
}

#[tokio::test]
async fn status_returns_config_flags() {
    let (app, _db) = create_test_app().await;

    let req = Request::builder()
        .uri("/api/status")
        .body(Body::empty())
        .unwrap();

    let resp = app.oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
}

#[tokio::test]
async fn openapi_json_returns_200() {
    let (app, _db) = create_test_app().await;

    let req = Request::builder()
        .uri("/api/openapi.json")
        .body(Body::empty())
        .unwrap();

    let resp = app.oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
}
