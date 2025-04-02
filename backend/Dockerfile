# Utiliser l'image Node.js officielle basée sur Alpine
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /usr/src/app

# Copier les fichiers de dépendances et le schéma Prisma
COPY package*.json ./
COPY prisma ./prisma/

# Installer les dépendances y compris Prisma CLI
RUN npm install
RUN npm install prisma -g

# Générer le client Prisma
RUN npx prisma generate

# Copier le code source
COPY . .

# Compiler le code TypeScript
RUN npm run build

# Exposer le port (celui défini dans .env, ici 3000)
EXPOSE 3000

# Démarrer l'application en mode production
#CMD ["node", "dist/server.js"]
CMD npx prisma migrate deploy && node dist/server.js
