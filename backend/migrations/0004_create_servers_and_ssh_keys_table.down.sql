-- Add down migration script here
BEGIN;

DROP TYPE AuthType;
DROP TYPE ServerType;
DROP TABLE servers;
DROP TABLE ssh_keys;

COMMIT;
