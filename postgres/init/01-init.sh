#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    -- No backslashes needed for $ or ! in single-quoted passwords
    CREATE USER db_root_user WITH SUPERUSER PASSWORD 'T4m$8gLq#vR3!pK9';
    CREATE DATABASE encadrinyv01;
    GRANT ALL PRIVILEGES ON DATABASE encadrinyv01 TO db_root_user;
    
    -- Password matches .env's URL-encoded credentials (T4m$8gLqXvR3!pK9)
    CREATE USER encadrin_api_usr WITH PASSWORD 'T4m$8gLqXvR3!pK9';
    
    -- Grant necessary privileges for Prisma
    GRANT CONNECT, CREATE ON DATABASE encadrinyv01 TO encadrin_api_usr;
    GRANT USAGE ON SCHEMA public TO encadrin_api_usr;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO encadrin_api_usr;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO encadrin_api_usr;
EOSQL