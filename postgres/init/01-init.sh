#!/bin/bash
set -eo pipefail

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE ROLE encadrin_api_usr WITH LOGIN PASSWORD 'T4m$8gLqXvR3!pK9';
    ALTER ROLE encadrin_api_usr CREATEDB;
    GRANT ALL PRIVILEGES ON DATABASE encadrinyv01 TO encadrin_api_usr;
EOSQL