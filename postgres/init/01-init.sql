-- Création du rôle avec droits étendus pour Prisma
CREATE ROLE encadrin_api_usr WITH 
    LOGIN 
    PASSWORD '${API_DB_PASSWORD}'
    CREATEDB   -- Nécessaire pour les migrations
    CREATEROLE;-- Nécessaire pour la gestion des schémas

-- Création de la base de données avec ownership explicite
CREATE DATABASE encadrinyv01 
    OWNER encadrin_api_usr 
    ENCODING 'UTF8';

-- Accorder tous les privilèges + héritage futur
GRANT ALL PRIVILEGES ON DATABASE encadrinyv01 TO encadrin_api_usr;
ALTER DEFAULT PRIVILEGES FOR ROLE encadrin_api_usr IN SCHEMA public 
    GRANT ALL ON TABLES TO encadrin_api_usr;