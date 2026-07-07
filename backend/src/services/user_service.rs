use std::sync::Arc;

use argon2::{password_hash::SaltString, Argon2, PasswordHasher, PasswordVerifier};
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

impl User {
    pub fn verify_password(&self, password: &str) -> Result<(), AppError> {
        let parsed_hash = argon2::PasswordHash::new(&self.password_hash)
            .map_err(|e| AppError::InternalServerError(e.to_string()))?;
        Argon2::default()
            .verify_password(password.as_bytes(), &parsed_hash)
            .map_err(|_| AppError::InvalidCredentials)
    }
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

    pub async fn get_by_email(&self, email: &str) -> Result<Option<User>, AppError> {
        sqlx::query_as::<_, User>(
            "SELECT id, name, email, password_hash, account_type, created_at FROM users WHERE email = $1",
        )
        .bind(email)
        .fetch_optional(&*self.db)
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

#[cfg(test)]
mod tests {
    use super::*;
    use crate::test_helpers::test_helpers::create_test_db;
    use chrono::Utc;

    fn test_user(email: &str, password: &str) -> User {
        User {
            id: None,
            name: "Test User".into(),
            email: email.into(),
            password_hash: password.into(),
            account_type: AccountType::Admin,
            created_at: Utc::now(),
        }
    }

    #[tokio::test]
    async fn create_user_persists_and_hashes_password() {
        let db = Arc::new(create_test_db().await);
        let svc = UserService::new(db.clone());

        let user = svc.create_user(test_user("a@b.com", "password123")).await.unwrap();

        assert!(user.id.is_some());
        assert_eq!(user.email, "a@b.com");
        assert_ne!(user.password_hash, "password123");
        user.verify_password("password123").expect("password should verify");
    }

    #[tokio::test]
    async fn create_user_duplicate_email_fails() {
        let db = Arc::new(create_test_db().await);
        let svc = UserService::new(db.clone());

        svc.create_user(test_user("dup@test.com", "password123")).await.unwrap();
        let result = svc.create_user(test_user("dup@test.com", "otherpass")).await;

        assert!(result.is_err());
    }

    #[tokio::test]
    async fn count_users_returns_zero_for_empty_db() {
        let db = Arc::new(create_test_db().await);
        let svc = UserService::new(db.clone());

        assert_eq!(svc.count_users().await.unwrap(), 0);
    }

    #[tokio::test]
    async fn count_users_increments_after_create() {
        let db = Arc::new(create_test_db().await);
        let svc = UserService::new(db.clone());

        svc.create_user(test_user("u1@test.com", "pass1")).await.unwrap();
        assert_eq!(svc.count_users().await.unwrap(), 1);

        svc.create_user(test_user("u2@test.com", "pass2")).await.unwrap();
        assert_eq!(svc.count_users().await.unwrap(), 2);
    }

    #[tokio::test]
    async fn get_by_email_returns_user_when_exists() {
        let db = Arc::new(create_test_db().await);
        let svc = UserService::new(db.clone());

        svc.create_user(test_user("findme@test.com", "secret123")).await.unwrap();

        let found = svc.get_by_email("findme@test.com").await.unwrap();
        assert!(found.is_some());
        assert_eq!(found.unwrap().name, "Test User");
    }

    #[tokio::test]
    async fn get_by_email_returns_none_for_unknown_email() {
        let db = Arc::new(create_test_db().await);
        let svc = UserService::new(db.clone());

        let found = svc.get_by_email("nobody@test.com").await.unwrap();
        assert!(found.is_none());
    }

    #[test]
    fn hash_password_produces_valid_argon2_hash() {
        let hash = UserService::hash_password("mypassword").unwrap();
        assert!(hash.starts_with("$argon2"));
    }

    #[test]
    fn verify_password_accepts_correct_password() {
        let hash = UserService::hash_password("correct").unwrap();
        let user = User {
            id: Some(1),
            name: "test".into(),
            email: "t@t.com".into(),
            password_hash: hash,
            account_type: AccountType::Admin,
            created_at: Utc::now(),
        };

        user.verify_password("correct").unwrap();
    }

    #[test]
    fn verify_password_rejects_wrong_password() {
        let hash = UserService::hash_password("correct").unwrap();
        let user = User {
            id: Some(1),
            name: "test".into(),
            email: "t@t.com".into(),
            password_hash: hash,
            account_type: AccountType::Admin,
            created_at: Utc::now(),
        };

        let result = user.verify_password("wrongpassword");
        assert!(result.is_err());
    }
}
