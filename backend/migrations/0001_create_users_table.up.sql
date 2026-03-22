-- Add up migration script here
CREATE TABLE users (
    id          INTEGER PRIMARY KEY NOT NULL,
    name        TEXT NOT NULL,
    email       TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    account_type TEXT NOT NULL,
    created_at  TEXT NOT NULL
);