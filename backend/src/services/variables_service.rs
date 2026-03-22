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
