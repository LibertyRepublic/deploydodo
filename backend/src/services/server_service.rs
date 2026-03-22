use std::sync::Arc;

use chrono::Utc;
use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;
use utoipa::ToSchema;

use crate::error::AppError;
use crate::services::ssh_service::SshService;
use crate::services::types::RemoteAuth;

#[derive(Debug, Serialize, Deserialize, ToSchema, sqlx::Type, Clone)]
#[serde(rename_all = "lowercase")]
#[sqlx(type_name = "TEXT", rename_all = "lowercase")]
pub enum ServerType {
    Local,
    Remote,
}

#[derive(Debug)]
pub struct Server {
    pub id: i64,
    pub name: String,
    pub server_type: ServerType,
    pub hostname: String,
    pub ssh_port: Option<i64>,
    pub ssh_key_id: Option<i64>,
}

pub struct ServerService {
    db: Arc<SqlitePool>,
    ssh_service: Arc<SshService>,
}

impl ServerService {
    pub fn new(db: Arc<SqlitePool>, ssh_service: Arc<SshService>) -> Self {
        Self { db, ssh_service }
    }

    pub async fn count_local_servers(&self) -> Result<i64, AppError> {
        sqlx::query_scalar("SELECT COUNT(*) FROM servers WHERE server_type = 'local'")
            .fetch_one(&*self.db)
            .await
            .map_err(AppError::Database)
    }

    pub async fn create_local_server(
        &self,
        name: &str,
        hostname: &str,
    ) -> Result<Server, AppError> {
        let id: i64 = sqlx::query_scalar(
            "INSERT INTO servers (name, server_type, hostname, created_at) VALUES ($1, $2, $3, $4) RETURNING id",
        )
        .bind(name)
        .bind(ServerType::Local)
        .bind(hostname)
        .bind(Utc::now())
        .fetch_one(&*self.db)
        .await
        .map_err(AppError::Database)?;

        Ok(Server {
            id,
            name: name.to_string(),
            server_type: ServerType::Local,
            hostname: hostname.to_string(),
            ssh_port: None,
            ssh_key_id: None,
        })
    }

    pub async fn create_remote_server(
        &self,
        name: &str,
        hostname: &str,
        ssh_port: i64,
        auth: RemoteAuth<'_>,
    ) -> Result<Server, AppError> {
        let key_name = format!("{name}-key");

        let ssh_key = match auth {
            RemoteAuth::Password { username, password } => {
                self.ssh_service
                    .create_password_auth(&key_name, username, password)
                    .await?
            }
            RemoteAuth::KeyPair {
                username,
                private_key,
                public_key,
            } => {
                self.ssh_service
                    .create_key_auth(&key_name, username, private_key, public_key)
                    .await?
            }
        };

        let server_id: i64 = sqlx::query_scalar(
            "INSERT INTO servers (name, server_type, hostname, ssh_port, ssh_key_id, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
        )
        .bind(name)
        .bind(ServerType::Remote)
        .bind(hostname)
        .bind(ssh_port)
        .bind(ssh_key.id)
        .bind(Utc::now())
        .fetch_one(&*self.db)
        .await
        .map_err(AppError::Database)?;

        Ok(Server {
            id: server_id,
            name: name.to_string(),
            server_type: ServerType::Remote,
            hostname: hostname.to_string(),
            ssh_port: Some(ssh_port),
            ssh_key_id: Some(ssh_key.id),
        })
    }
}
