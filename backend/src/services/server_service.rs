use std::sync::Arc;

use chrono::Utc;
use serde::{Deserialize, Serialize};
use sqlx::{Row, SqlitePool};
use utoipa::ToSchema;

use crate::error::AppError;

#[derive(Debug, Serialize, Deserialize, ToSchema, sqlx::Type, Clone, PartialEq)]
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
    pub ssh_port: Option<u16>,
    pub ssh_key_id: Option<i64>,
}

pub struct ServerService {
    db: Arc<SqlitePool>,
}

impl ServerService {
    pub fn new(db: Arc<SqlitePool>) -> Self {
        Self { db }
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

    pub async fn get_server_by_id(&self, server_id: i64) -> Result<Server, AppError> {
        let row = sqlx::query(
            "SELECT id, name, server_type, hostname, ssh_port, ssh_key_id FROM servers WHERE id = $1",
        )
        .bind(server_id)
        .fetch_optional(&*self.db)
        .await
        .map_err(AppError::Database)?
        .ok_or(AppError::NotFound("Server not found".into()))?;

        Ok(Server {
            id: row.try_get("id").map_err(AppError::Database)?,
            name: row.try_get("name").map_err(AppError::Database)?,
            server_type: row.try_get("server_type").map_err(AppError::Database)?,
            hostname: row.try_get("hostname").map_err(AppError::Database)?,
            ssh_port: row.try_get("ssh_port").map_err(AppError::Database)?,
            ssh_key_id: row.try_get("ssh_key_id").map_err(AppError::Database)?,
        })
    }

    pub async fn list_servers(&self) -> Result<Vec<Server>, AppError> {
        let rows = sqlx::query(
            "SELECT id, name, server_type, hostname, ssh_port, ssh_key_id FROM servers ORDER BY id",
        )
        .fetch_all(&*self.db)
        .await
        .map_err(AppError::Database)?;

        let mut servers = vec![];
        for row in rows {
            servers.push(Server {
                id: row.try_get("id").map_err(AppError::Database)?,
                name: row.try_get("name").map_err(AppError::Database)?,
                server_type: row.try_get("server_type").map_err(AppError::Database)?,
                hostname: row.try_get("hostname").map_err(AppError::Database)?,
                ssh_port: row.try_get("ssh_port").map_err(AppError::Database)?,
                ssh_key_id: row.try_get("ssh_key_id").map_err(AppError::Database)?,
            });
        }
        Ok(servers)
    }

    pub async fn create_remote_server(
        &self,
        name: &str,
        hostname: &str,
        ssh_port: u16,
        ssh_key_id: i64,
    ) -> Result<Server, AppError> {
        let server_id: i64 = sqlx::query_scalar(
            "INSERT INTO servers (name, server_type, hostname, ssh_port, ssh_key_id, created_at) \
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
        )
        .bind(name)
        .bind(ServerType::Remote)
        .bind(hostname)
        .bind(ssh_port)
        .bind(ssh_key_id)
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
            ssh_key_id: Some(ssh_key_id),
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::test_helpers::test_helpers::create_test_db;

    #[tokio::test]
    async fn create_local_server_persists_and_returns_server() {
        let db = Arc::new(create_test_db().await);
        let svc = ServerService::new(db);

        let server = svc.create_local_server("my-server", "localhost").await.unwrap();

        assert!(server.id > 0);
        assert_eq!(server.name, "my-server");
        assert_eq!(server.hostname, "localhost");
        assert_eq!(server.server_type, ServerType::Local);
        assert!(server.ssh_port.is_none());
        assert!(server.ssh_key_id.is_none());
    }

    #[tokio::test]
    async fn count_local_servers_returns_zero_for_empty_db() {
        let db = Arc::new(create_test_db().await);
        let svc = ServerService::new(db);

        assert_eq!(svc.count_local_servers().await.unwrap(), 0);
    }

    #[tokio::test]
    async fn count_local_servers_returns_one_after_create() {
        let db = Arc::new(create_test_db().await);
        let svc = ServerService::new(db);

        svc.create_local_server("s1", "h1").await.unwrap();
        assert_eq!(svc.count_local_servers().await.unwrap(), 1);
    }

    #[tokio::test]
    async fn get_server_by_id_returns_server_when_found() {
        let db = Arc::new(create_test_db().await);
        let svc = ServerService::new(db);

        let created = svc.create_local_server("find-me", "host.local").await.unwrap();

        let found = svc.get_server_by_id(created.id).await.unwrap();
        assert_eq!(found.name, "find-me");
        assert_eq!(found.hostname, "host.local");
    }

    #[tokio::test]
    async fn get_server_by_id_returns_error_for_nonexistent_id() {
        let db = Arc::new(create_test_db().await);
        let svc = ServerService::new(db);

        let result = svc.get_server_by_id(99999).await;
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn list_servers_returns_empty_for_empty_db() {
        let db = Arc::new(create_test_db().await);
        let svc = ServerService::new(db);

        assert!(svc.list_servers().await.unwrap().is_empty());
    }

    #[tokio::test]
    async fn list_servers_returns_all_created_servers() {
        let db = Arc::new(create_test_db().await);
        let svc = ServerService::new(db);

        svc.create_local_server("s1", "h1").await.unwrap();
        svc.create_local_server("s2", "h2").await.unwrap();

        let list = svc.list_servers().await.unwrap();
        assert_eq!(list.len(), 2);
        let names: Vec<&str> = list.iter().map(|s| s.name.as_str()).collect();
        assert!(names.contains(&"s1"));
        assert!(names.contains(&"s2"));
    }

    #[tokio::test]
    async fn create_remote_server_persists_with_ssh_key_id() {
        let db = Arc::new(create_test_db().await);
        let svc = ServerService::new(db.clone());

        sqlx::query("INSERT INTO ssh_keys (id, name, username, auth_type, created_at) VALUES (5, 'k', 'u', 'password', datetime('now'))")
            .execute(&*db)
            .await
            .unwrap();

        let server = svc
            .create_remote_server("remote1", "example.com", 2222, 5)
            .await
            .unwrap();

        assert!(server.id > 0);
        assert_eq!(server.server_type, ServerType::Remote);
        assert_eq!(server.ssh_port, Some(2222));
        assert_eq!(server.ssh_key_id, Some(5));
    }
}
