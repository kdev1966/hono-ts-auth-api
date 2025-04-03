-- Supprimer le rôle et la base si existants (pour les tests)
DROP ROLE IF EXISTS encadrin_api_usr;
DROP DATABASE IF EXISTS encadrinyv01;

-- Recréer avec encodage explicite
CREATE ROLE encadrin_api_usr WITH 
    LOGIN 
    PASSWORD 'dR89V4TBDsxtQ9hv' 
    CREATEDB 
    CREATEROLE;

CREATE DATABASE encadrinyv01
    OWNER encadrin_api_usr
    ENCODING 'UTF8'
    LC_COLLATE 'C'
    LC_CTYPE 'C'
    TEMPLATE template0;

-- Accorder les privilèges étendus
\c encadrinyv01
ALTER DEFAULT PRIVILEGES FOR ROLE encadrin_api_usr IN SCHEMA public 
    GRANT ALL ON TABLES TO encadrin_api_usr;