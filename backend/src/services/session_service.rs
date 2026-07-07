use std::sync::Arc;

use chrono::Utc;
use rand_core::{OsRng, RngCore};
use sqlx::SqlitePool;

use crate::error::AppError;

pub struct SessionService {
    db: Arc<SqlitePool>,
}

impl SessionService {
    pub fn new(db: Arc<SqlitePool>) -> Self {
        Self { db }
    }

    pub async fn validate_session(&self, token: &str) -> Result<bool, AppError> {
        let exists: bool = sqlx::query_scalar(
            "SELECT EXISTS(SELECT * FROM auth_sessions WHERE session_token = $1)",
        )
        .bind(token)
        .fetch_one(&*self.db)
        .await
        .map_err(AppError::Database)?;

        Ok(exists)
    }

    pub async fn resolve_session(&self, token: &str) -> Result<Option<i64>, AppError> {
        let user_id: Option<i64> = sqlx::query_scalar(
            "SELECT user_id FROM auth_sessions WHERE session_token = $1",
        )
        .bind(token)
        .fetch_optional(&*self.db)
        .await
        .map_err(AppError::Database)?;

        Ok(user_id)
    }

    pub async fn create_session(&self, user_id: i64) -> Result<String, AppError> {
        let mut bytes = [0u8; 32];
        OsRng.fill_bytes(&mut bytes);
        let token = bytes.map(|b| format!("{b:02x}")).concat();

        sqlx::query(
            "INSERT INTO auth_sessions (user_id, session_token, created_at) VALUES ($1, $2, $3)",
        )
        .bind(user_id)
        .bind(&token)
        .bind(Utc::now())
        .execute(&*self.db)
        .await
        .map_err(AppError::Database)?;

        Ok(token)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::test_helpers::test_helpers::create_test_db;

    async fn insert_user(db: &SqlitePool, id: i64) {
        sqlx::query("INSERT INTO users (id, name, email, password_hash, account_type, created_at) VALUES ($1, 'test', 'test@t.com', 'hash', 'admin', datetime('now'))")
            .bind(id)
            .execute(db)
            .await
            .unwrap();
    }

    #[tokio::test]
    async fn create_session_returns_non_empty_token() {
        let db = Arc::new(create_test_db().await);
        insert_user(&db, 1).await;
        let svc = SessionService::new(db);

        let token = svc.create_session(1).await.unwrap();
        assert!(!token.is_empty());
        assert_eq!(token.len(), 64);
    }

    #[tokio::test]
    async fn validate_session_returns_true_for_valid_token() {
        let db = Arc::new(create_test_db().await);
        insert_user(&db, 1).await;
        let svc = SessionService::new(db);

        let token = svc.create_session(1).await.unwrap();
        assert!(svc.validate_session(&token).await.unwrap());
    }

    #[tokio::test]
    async fn validate_session_returns_false_for_invalid_token() {
        let db = Arc::new(create_test_db().await);
        let svc = SessionService::new(db);

        assert!(!svc.validate_session("nonexistent-token").await.unwrap());
    }

    #[tokio::test]
    async fn validate_session_returns_false_for_empty_token() {
        let db = Arc::new(create_test_db().await);
        let svc = SessionService::new(db);

        assert!(!svc.validate_session("").await.unwrap());
    }

    #[tokio::test]
    async fn resolve_session_returns_user_id_for_valid_token() {
        let db = Arc::new(create_test_db().await);
        insert_user(&db, 42).await;
        let svc = SessionService::new(db);

        let token = svc.create_session(42).await.unwrap();
        assert_eq!(svc.resolve_session(&token).await.unwrap(), Some(42));
    }

    #[tokio::test]
    async fn resolve_session_returns_none_for_invalid_token() {
        let db = Arc::new(create_test_db().await);
        let svc = SessionService::new(db);

        assert_eq!(svc.resolve_session("bogus").await.unwrap(), None);
    }

    #[tokio::test]
    async fn tokens_are_unique_across_multiple_creations() {
        let db = Arc::new(create_test_db().await);
        insert_user(&db, 1).await;
        let svc = SessionService::new(db);

        let t1 = svc.create_session(1).await.unwrap();
        let t2 = svc.create_session(1).await.unwrap();

        assert_ne!(t1, t2);
    }
}
