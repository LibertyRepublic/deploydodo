use std::sync::Arc;

use chrono::Utc;
use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;
use utoipa::ToSchema;

use crate::error::AppError;

#[derive(Debug, Serialize, Deserialize, ToSchema, sqlx::Type, Clone)]
#[serde(rename_all = "lowercase")]
#[sqlx(type_name = "TEXT", rename_all = "lowercase")]
pub enum AuthType {
    Password,
    KeyPair,
}

pub enum RemoteAuth<'a> {
    Password {
        username: &'a str,
        password: &'a str,
    },
    KeyPair {
        username: &'a str,
        private_key: &'a str,
        public_key: Option<&'a str>,
    },
}

pub struct SshKey {
    pub id: i64,
    pub name: String,
    username: String,
    auth_type: AuthType,
    password: Option<String>,
    private_key: Option<String>,
    public_key: Option<String>,
}

impl SshKey {
    pub fn username(&self) -> &str {
        &self.username
    }

    pub fn get_secret(&self) -> Result<&str, AppError> {
        match self.auth_type {
            AuthType::Password => self.password.as_deref().ok_or(AppError::MissingKeySecret),
            AuthType::KeyPair => self
                .private_key
                .as_deref()
                .ok_or(AppError::MissingKeySecret),
        }
    }
}

pub struct SshService {
    db: Arc<SqlitePool>,
}

impl SshService {
    pub fn new(db: Arc<SqlitePool>) -> Self {
        Self { db }
    }

    pub async fn create_password_auth(
        &self,
        name: &str,
        username: &str,
        password: &str,
    ) -> Result<SshKey, AppError> {
        let id: i64 = sqlx::query_scalar(
            "INSERT INTO ssh_keys (name, username, password, auth_type, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING id",
        )
        .bind(name)
        .bind(username)
        .bind(password)
        .bind(AuthType::Password)
        .bind(Utc::now())
        .fetch_one(&*self.db)
        .await
        .map_err(AppError::Database)?;

        Ok(SshKey {
            id,
            name: name.to_string(),
            username: username.to_string(),
            password: Some(password.to_string()),
            auth_type: AuthType::Password,
            private_key: None,
            public_key: None,
        })
    }

    pub async fn create_key_auth(
        &self,
        name: &str,
        username: &str,
        private_key: &str,
        public_key: Option<&str>,
    ) -> Result<SshKey, AppError> {
        let id: i64 = sqlx::query_scalar(
            "INSERT INTO ssh_keys (name, username, private_key, public_key, auth_type, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
        )
        .bind(name)
        .bind(username)
        .bind(private_key)
        .bind(public_key)
        .bind(AuthType::KeyPair)
        .bind(Utc::now())
        .fetch_one(&*self.db)
        .await
        .map_err(AppError::Database)?;

        Ok(SshKey {
            id,
            name: name.to_string(),
            username: username.to_string(),
            password: None,
            auth_type: AuthType::KeyPair,
            private_key: Some(private_key.to_string()),
            public_key: public_key.map(|key| key.to_string()),
        })
    }
}
