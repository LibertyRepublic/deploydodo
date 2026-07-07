#[cfg(test)]
pub mod test_helpers {
    use sqlx::SqlitePool;

    pub async fn create_test_db() -> SqlitePool {
        let pool = SqlitePool::connect("sqlite::memory:").await.unwrap();
        sqlx::migrate!("./migrations").run(&pool).await.unwrap();
        pool
    }
}
