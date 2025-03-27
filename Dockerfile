# Utiliser l'image Node.js officielle basée sur Alpine
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /usr/src/app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le code source
COPY . .

# Générer le client Prisma
RUN npx prisma generate

# Compiler TypeScript (optionnel si vous préférez ts-node-dev en prod, ici nous utilisons ts-node pour simplifier)
RUN npm install -g ts-node

# Exposer le port (celui défini dans .env, ici 3000)
EXPOSE 3000

# Démarrer l'application en mode production
CMD ["ts-node", "src/server.ts"]
