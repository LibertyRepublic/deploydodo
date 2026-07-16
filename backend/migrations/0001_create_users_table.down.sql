-- Add down migration script here
BEGIN;

DROP TYPE AccountType;
DROP TABLE users;

COMMIT;
