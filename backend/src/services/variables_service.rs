use std::sync::Arc;

use chrono::Utc;
use sqlx::SqlitePool;

use crate::error::AppError;

pub struct VariablesService {
    db: Arc<SqlitePool>,
}

impl VariablesService {
    pub fn new(db: Arc<SqlitePool>) -> Self {
        Self { db }
    }

    pub async fn get(&self, name: &str) -> Result<Option<String>, AppError> {
        sqlx::query_scalar("SELECT value FROM variables WHERE name = $1")
            .bind(name)
            .fetch_optional(&*self.db)
            .await
            .map_err(AppError::Database)
    }

    pub async fn set(&self, name: &str, value: &str) -> Result<(), AppError> {
        sqlx::query(
            "INSERT INTO variables (name, value, created_at) VALUES ($1, $2, $3)
             ON CONFLICT(name) DO UPDATE SET value = excluded.value",
        )
        .bind(name)
        .bind(value)
        .bind(Utc::now())
        .execute(&*self.db)
        .await
        .map_err(AppError::Database)?;

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::test_helpers::test_helpers::create_test_db;

    #[tokio::test]
    async fn get_returns_none_for_missing_key() {
        let db = Arc::new(create_test_db().await);
        let svc = VariablesService::new(db);

        assert_eq!(svc.get("nonexistent").await.unwrap(), None);
    }

    #[tokio::test]
    async fn set_and_get_roundtrip() {
        let db = Arc::new(create_test_db().await);
        let svc = VariablesService::new(db);

        svc.set("my_key", "my_value").await.unwrap();
        assert_eq!(svc.get("my_key").await.unwrap(), Some("my_value".into()));
    }

    #[tokio::test]
    async fn set_overwrites_existing_value() {
        let db = Arc::new(create_test_db().await);
        let svc = VariablesService::new(db);

        svc.set("key", "value1").await.unwrap();
        svc.set("key", "value2").await.unwrap();
        assert_eq!(svc.get("key").await.unwrap(), Some("value2".into()));
    }
}
