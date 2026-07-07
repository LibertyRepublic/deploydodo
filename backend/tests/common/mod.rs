use std::sync::Arc;

use backend::connectors::SshConnector;
use backend::dependencies::{self, Dependencies};
use sqlx::SqlitePool;

pub async fn create_test_db() -> Arc<SqlitePool> {
    let pool = SqlitePool::connect("sqlite::memory:").await.unwrap();
    sqlx::migrate!("./migrations").run(&pool).await.unwrap();
    Arc::new(pool)
}

pub async fn create_test_app() -> (axum::Router, Arc<SqlitePool>) {
    let db = create_test_db().await;
    let deps = Dependencies::with_db(db.clone()).await.unwrap();
    let app = dependencies::build_router(deps);
    (app, db)
}

pub async fn create_test_app_with_ssh_connector(
    ssh_connector: Arc<dyn SshConnector>,
) -> (axum::Router, Arc<SqlitePool>) {
    let db = create_test_db().await;
    let deps = Dependencies::with_db_and_connectors(db.clone(), ssh_connector).await.unwrap();
    let app = dependencies::build_router(deps);
    (app, db)
}

pub async fn create_user_and_get_token(db: &SqlitePool, email: &str, password: &str) -> String {
    use argon2::{
        password_hash::{rand_core::OsRng, PasswordHasher, SaltString},
        Argon2,
    };
    use chrono::Utc;
    use rand_core::RngCore;

    let salt = SaltString::generate(&mut OsRng);
    let password_hash = Argon2::default()
        .hash_password(password.as_bytes(), &salt)
        .unwrap()
        .to_string();

    sqlx::query(
        "INSERT INTO users (name, email, password_hash, account_type, created_at) \
         VALUES ($1, $2, $3, 'admin', $4)",
    )
    .bind("Test User")
    .bind(email)
    .bind(&password_hash)
    .bind(Utc::now())
    .execute(db)
    .await
    .unwrap();

    let user_id: i64 = sqlx::query_scalar("SELECT id FROM users WHERE email = $1")
        .bind(email)
        .fetch_one(db)
        .await
        .unwrap();

    let mut bytes = [0u8; 32];
    OsRng.fill_bytes(&mut bytes);
    let token = bytes.map(|b| format!("{b:02x}")).concat();

    sqlx::query(
        "INSERT INTO auth_sessions (user_id, session_token, created_at) VALUES ($1, $2, $3)",
    )
    .bind(user_id)
    .bind(&token)
    .bind(Utc::now())
    .execute(db)
    .await
    .unwrap();

    token
}
