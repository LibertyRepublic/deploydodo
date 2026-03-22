use std::sync::Arc;

use crate::{
    db,
    services::{ServerService, SessionService, SshService, UserService, VariablesService},
};

#[derive(Clone)]
pub struct Dependencies {
    pub user_service: Arc<UserService>,
    pub session_service: Arc<SessionService>,
    pub variables_service: Arc<VariablesService>,
    pub server_service: Arc<ServerService>,
}

impl Dependencies {
    pub async fn init() -> Result<Self, sqlx::Error> {
        let database_url =
            std::env::var("DATABASE_URL").unwrap_or_else(|_| "sqlite:./deploydodo.db".into());

        let db = Arc::new(db::create_pool(&database_url).await?);
        let user_service = Arc::new(UserService::new(db.clone()));
        let session_service = Arc::new(SessionService::new(db.clone()));
        let variables_service = Arc::new(VariablesService::new(db.clone()));
        let ssh_service = Arc::new(SshService::new(db.clone()));
        let server_service = Arc::new(ServerService::new(db.clone(), ssh_service.clone()));

        Ok(Self {
            user_service,
            session_service,
            variables_service,
            server_service,
        })
    }
}
