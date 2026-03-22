-- Add up migration script here
CREATE TABLE auth_sessions(
    id INTEGER PRIMARY KEY NOT NULL,
    user_id INTEGER NOT NULL,
    session_token TEXT NOT NULL,
    created_at  TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
