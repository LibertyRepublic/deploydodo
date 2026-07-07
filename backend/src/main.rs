use backend::dependencies::{self, Dependencies};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() {
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or(
                tracing_subscriber::EnvFilter::new("backend=debug,tower_http=debug"),
            ),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let deps = Dependencies::init()
        .await
        .expect("failed to initialize dependencies");

    let app = dependencies::build_router(deps);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    tracing::info!("listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}
