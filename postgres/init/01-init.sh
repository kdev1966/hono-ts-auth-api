#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE USER db_root_user WITH SUPERUSER PASSWORD 'T4m\$8gLq#vR3\!pK9';
    CREATE DATABASE encadrinyv01;
    GRANT ALL PRIVILEGES ON DATABASE encadrinyv01 TO db_root_user;
    
    CREATE USER encadrin_api_usr WITH PASSWORD 'T4m\$8gLqXvR3\!pK9';
    GRANT CONNECT ON DATABASE encadrinyv01 TO encadrin_api_usr;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO encadrin_api_usr;
EOSQL