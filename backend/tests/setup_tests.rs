mod common;

use axum::http::{header, Request, StatusCode};
use axum::body::Body;
use common::{create_test_app, create_test_app_with_ssh_connector, create_user_and_get_token};
use backend::connectors::test_fakes::{FakeSshConnector, FakeSshSession};
use serde_json::json;
use std::sync::Arc;
use tower::ServiceExt;

#[tokio::test]
async fn create_admin_returns_201_when_no_admin_exists() {
    let (app, _db) = create_test_app().await;

    let req = Request::builder()
        .uri("/api/setup/admin")
        .method("POST")
        .header(header::CONTENT_TYPE, "application/json")
        .body(Body::from(
            json!({
                "name": "Admin",
                "email": "admin@deploydodo.app",
                "password": "securePass123"
            })
            .to_string(),
        ))
        .unwrap();

    let resp = app.oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::CREATED);
}

#[tokio::test]
async fn create_admin_returns_409_when_admin_already_exists() {
    let (app, _db) = create_test_app().await;

    let req = Request::builder()
        .uri("/api/setup/admin")
        .method("POST")
        .header(header::CONTENT_TYPE, "application/json")
        .body(Body::from(
            json!({
                "name": "First Admin",
                "email": "first@deploydodo.app",
                "password": "securePass123"
            })
            .to_string(),
        ))
        .unwrap();
    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::CREATED);

    let req2 = Request::builder()
        .uri("/api/setup/admin")
        .method("POST")
        .header(header::CONTENT_TYPE, "application/json")
        .body(Body::from(
            json!({
                "name": "Second Admin",
                "email": "second@deploydodo.app",
                "password": "securePass123"
            })
            .to_string(),
        ))
        .unwrap();
    let resp2 = app.oneshot(req2).await.unwrap();
    assert_eq!(resp2.status(), StatusCode::CONFLICT);
}

#[tokio::test]
async fn create_admin_with_empty_name_returns_422() {
    let (app, _db) = create_test_app().await;

    let req = Request::builder()
        .uri("/api/setup/admin")
        .method("POST")
        .header(header::CONTENT_TYPE, "application/json")
        .body(Body::from(
            json!({"name": "  ", "email": "a@b.com", "password": "securePass123"}).to_string(),
        ))
        .unwrap();

    let resp = app.oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::UNPROCESSABLE_ENTITY);
}

#[tokio::test]
async fn create_admin_with_short_password_returns_422() {
    let (app, _db) = create_test_app().await;

    let req = Request::builder()
        .uri("/api/setup/admin")
        .method("POST")
        .header(header::CONTENT_TYPE, "application/json")
        .body(Body::from(
            json!({"name": "Admin", "email": "a@b.com", "password": "short"}).to_string(),
        ))
        .unwrap();

    let resp = app.oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::UNPROCESSABLE_ENTITY);
}

#[tokio::test]
async fn create_local_server_without_auth_returns_401() {
    let (app, _db) = create_test_app().await;

    let req = Request::builder()
        .uri("/api/setup/server/local")
        .method("POST")
        .header(header::CONTENT_TYPE, "application/json")
        .body(Body::from(
            json!({"name": "my-server", "hostname": "localhost"}).to_string(),
        ))
        .unwrap();

    let resp = app.oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::UNAUTHORIZED);
}

#[tokio::test]
async fn create_local_server_with_auth_returns_201() {
    let (app, db) = create_test_app().await;
    let token = create_user_and_get_token(&db, "admin@test.com", "password").await;

    let req = Request::builder()
        .uri("/api/setup/server/local")
        .method("POST")
        .header(header::CONTENT_TYPE, "application/json")
        .header(header::AUTHORIZATION, format!("Bearer {}", token))
        .body(Body::from(
            json!({"name": "my-server", "hostname": "localhost"}).to_string(),
        ))
        .unwrap();

    let resp = app.oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::CREATED);
}

#[tokio::test]
async fn create_local_server_duplicate_returns_409() {
    let (app, db) = create_test_app().await;
    let token = create_user_and_get_token(&db, "admin@test.com", "password").await;

    let make_req = |_app: &axum::Router| -> Request<Body> {
        Request::builder()
            .uri("/api/setup/server/local")
            .method("POST")
            .header(header::CONTENT_TYPE, "application/json")
            .header(header::AUTHORIZATION, format!("Bearer {}", token))
            .body(Body::from(
                json!({"name": "s1", "hostname": "h1"}).to_string(),
            ))
            .unwrap()
    };

    let resp1 = app.clone().oneshot(make_req(&app)).await.unwrap();
    assert_eq!(resp1.status(), StatusCode::CREATED);

    let resp2 = app.clone().oneshot(make_req(&app)).await.unwrap();
    assert_eq!(resp2.status(), StatusCode::CONFLICT);
}

#[tokio::test]
async fn create_local_server_empty_name_returns_422() {
    let (app, db) = create_test_app().await;
    let token = create_user_and_get_token(&db, "admin@test.com", "password").await;

    let req = Request::builder()
        .uri("/api/setup/server/local")
        .method("POST")
        .header(header::CONTENT_TYPE, "application/json")
        .header(header::AUTHORIZATION, format!("Bearer {}", token))
        .body(Body::from(
            json!({"name": "  ", "hostname": "localhost"}).to_string(),
        ))
        .unwrap();

    let resp = app.oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::UNPROCESSABLE_ENTITY);
}

#[tokio::test]
async fn create_remote_server_without_auth_returns_401() {
    let (app, _db) = create_test_app().await;

    let req = Request::builder()
        .uri("/api/setup/server/remote")
        .method("POST")
        .header(header::CONTENT_TYPE, "application/json")
        .body(Body::from(
            json!({
                "name": "remote1",
                "hostname": "example.com",
                "port": 22,
                "auth": { "authType": "password", "username": "root", "password": "secret" }
            })
            .to_string(),
        ))
        .unwrap();

    let resp = app.oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::UNAUTHORIZED);
}

#[tokio::test]
async fn create_remote_server_with_auth_returns_202() {
    let fake = Arc::new(FakeSshConnector::new(FakeSshSession::new_success()));
    let (app, db) = create_test_app_with_ssh_connector(fake.clone()).await;
    let token = create_user_and_get_token(&db, "admin@test.com", "password").await;

    let req = Request::builder()
        .uri("/api/setup/server/remote")
        .method("POST")
        .header(header::CONTENT_TYPE, "application/json")
        .header(header::AUTHORIZATION, format!("Bearer {}", token))
        .body(Body::from(
            json!({
                "name": "remote1",
                "hostname": "example.com",
                "port": 22,
                "auth": { "authType": "password", "username": "root", "password": "secret" }
            })
            .to_string(),
        ))
        .unwrap();

    let resp = app.oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::ACCEPTED);
}

#[tokio::test]
async fn create_remote_server_empty_name_returns_422() {
    let (app, db) = create_test_app().await;
    let token = create_user_and_get_token(&db, "admin@test.com", "password").await;

    let req = Request::builder()
        .uri("/api/setup/server/remote")
        .method("POST")
        .header(header::CONTENT_TYPE, "application/json")
        .header(header::AUTHORIZATION, format!("Bearer {}", token))
        .body(Body::from(
            json!({
                "name": "  ",
                "hostname": "example.com",
                "port": 22,
                "auth": { "authType": "password", "username": "root", "password": "secret" }
            })
            .to_string(),
        ))
        .unwrap();

    let resp = app.oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::UNPROCESSABLE_ENTITY);
}
