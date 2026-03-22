use sqlx::{
    sqlite::{SqliteConnectOptions, SqlitePool},
    ConnectOptions,
};
use std::str::FromStr;

pub async fn create_pool(database_url: &str) -> Result<SqlitePool, sqlx::Error> {
    let options = SqliteConnectOptions::from_str(database_url)?
        .create_if_missing(true)
        // Silence per-query logs; keep our own tracing
        .disable_statement_logging();

    let pool = SqlitePool::connect_with(options).await?;
    sqlx::migrate!("./migrations").run(&pool).await?;

    Ok(pool)
}
