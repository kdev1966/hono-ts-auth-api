#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE USER encadrin_api_usr WITH PASSWORD 'T4m$8gLqXvR3!pK9'; # Version brute
    CREATE DATABASE encadrinyv01;
    GRANT ALL PRIVILEGES ON DATABASE encadrinyv01 TO encadrin_api_usr;
EOSQL