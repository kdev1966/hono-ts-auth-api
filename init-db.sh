#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER encadrin_api_usr WITH PASSWORD 'T4m$8gLqXvR3!pK9';
    GRANT CONNECT ON DATABASE encadrinyv01 TO encadrin_api_usr;
    GRANT USAGE ON SCHEMA public TO encadrin_api_usr;
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO encadrin_api_usr;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO encadrin_api_usr;
EOSQL