#!/bin/bash
set -eo pipefail

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE ROLE encadrin_api_usr WITH LOGIN PASSWORD '${API_DB_PASSWORD}';
    CREATE DATABASE encadrinyv01;
    GRANT ALL PRIVILEGES ON DATABASE encadrinyv01 TO encadrin_api_usr;
    ALTER DATABASE encadrinyv01 OWNER TO encadrin_api_usr;
EOSQL