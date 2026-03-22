use std::sync::Arc;

use argon2::{password_hash::SaltString, Argon2, PasswordHasher};
use chrono::DateTime;
use rand_core::OsRng;
use serde::Serialize;
use sqlx::{FromRow, SqlitePool, Type};
use utoipa::ToSchema;

use crate::error::AppError;

pub struct UserService {
    db: Arc<SqlitePool>,
}

#[derive(Type, Serialize, ToSchema)]
#[serde(rename_all = "lowercase")]
#[sqlx(type_name = "TEXT", rename_all = "lowercase")]
pub enum AccountType {
    Admin,
    Member,
}

#[derive(FromRow)]
pub struct User {
    pub id: Option<i64>,
    pub name: String,
    pub email: String,
    pub password_hash: String,
    pub account_type: AccountType,
    pub created_at: DateTime<chrono::Utc>,
}

impl UserService {
    pub fn new(db: Arc<SqlitePool>) -> Self {
        Self { db }
    }

    pub async fn create_user(&self, mut user: User) -> Result<User, AppError> {
        user.password_hash = Self::hash_password(&user.password_hash)?;

        sqlx::query_as::<_, User>(
            "INSERT INTO users (name, email, password_hash, account_type, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        )
        .bind(&user.name)
        .bind(&user.email)
        .bind(&user.password_hash)
        .bind(&user.account_type)
        .bind(&user.created_at)
        .fetch_one(&*self.db)
        .await.map_err(AppError::Database)
    }

    pub async fn count_users(&self) -> Result<i64, AppError> {
        sqlx::query_scalar("SELECT COUNT(*) FROM users")
            .fetch_one(&*self.db)
            .await
            .map_err(AppError::Database)
    }

    fn hash_password(password: &str) -> Result<String, AppError> {
        let salt = SaltString::generate(&mut OsRng);
        Argon2::default()
            .hash_password(password.as_bytes(), &salt)
            .map_err(|_| AppError::PasswordHash)
            .map(|hash| hash.to_string())
    }
}
