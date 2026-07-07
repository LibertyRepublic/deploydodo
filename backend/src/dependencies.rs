use std::sync::Arc;

use axum::{
    middleware,
    routing::{get, post},
    Json, Router,
};
use sqlx::SqlitePool;
use tower_http::compression::CompressionLayer;
use tower_http::cors::{Any, CorsLayer};
use utoipa::OpenApi;

use crate::{
    auth,
    connectors::{RealSshConnector, SshConnector},
    db, openapi, routes,
    services::{
        JobService, ServerService, SessionService, SshService, UserService, VariablesService,
    },
};

pub fn build_router(deps: Dependencies) -> Router {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let public_routes = Router::new()
        .route("/api/health", get(routes::health::health))
        .route("/api/status", get(routes::status::status))
        .route("/api/auth/login", post(routes::login::login))
        .route("/api/setup/admin", post(routes::create_admin::create_admin))
        .route("/api/openapi.json", get(|| async { Json(openapi::ApiDoc::openapi()) }));

    let protected_routes = Router::new()
        .route(
            "/api/auth/validate",
            get(routes::validate_session::validate_session),
        )
        .route("/api/servers", get(routes::list_servers::list_servers))
        .route(
            "/api/servers/{server_id}/containers",
            get(routes::list_containers::list_containers),
        )
        .route(
            "/api/servers/{server_id}/terminal",
            get(routes::terminal::terminal_ws),
        )
        .route(
            "/api/setup/server/local",
            post(routes::create_local_server::create_local_server),
        )
        .route(
            "/api/setup/server/remote",
            post(routes::create_remote_server::create_remote_server),
        )
        .route(
            "/api/jobs/{job_id}/events",
            get(routes::job_events::job_events),
        )
        .layer(middleware::from_fn_with_state(
            deps.clone(),
            auth::require_auth,
        ));

    public_routes
        .merge(protected_routes)
        .with_state(deps)
        .layer(cors)
        .layer(CompressionLayer::new())
}

#[derive(Clone)]
pub struct Dependencies {
    pub user_service: Arc<UserService>,
    pub session_service: Arc<SessionService>,
    pub variables_service: Arc<VariablesService>,
    pub server_service: Arc<ServerService>,
    pub ssh_service: Arc<SshService>,
    pub job_service: Arc<JobService>,
    pub ssh_connector: Arc<dyn SshConnector>,
}

impl Dependencies {
    pub async fn init() -> Result<Self, sqlx::Error> {
        let database_url =
            std::env::var("DATABASE_URL").unwrap_or_else(|_| "sqlite:./deploydodo.db".into());

        let db = Arc::new(db::create_pool(&database_url).await?);
        Self::with_db(db).await
    }

    pub async fn with_db(db: Arc<SqlitePool>) -> Result<Self, sqlx::Error> {
        let ssh_connector: Arc<dyn SshConnector> = Arc::new(RealSshConnector);
        Self::with_db_and_connectors(db, ssh_connector).await
    }

    pub async fn with_db_and_connectors(
        db: Arc<SqlitePool>,
        ssh_connector: Arc<dyn SshConnector>,
    ) -> Result<Self, sqlx::Error> {
        let user_service = Arc::new(UserService::new(db.clone()));
        let session_service = Arc::new(SessionService::new(db.clone()));
        let variables_service = Arc::new(VariablesService::new(db.clone()));
        let ssh_service = Arc::new(SshService::new(db.clone()));
        let server_service = Arc::new(ServerService::new(db.clone()));
        let job_service = Arc::new(JobService::new(db.clone()));

        Ok(Self {
            user_service,
            session_service,
            variables_service,
            server_service,
            ssh_service,
            job_service,
            ssh_connector,
        })
    }
}
