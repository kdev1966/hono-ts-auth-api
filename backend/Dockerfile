# Étape de construction
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install
RUN npm install @peculiar/webcrypto
RUN npm install prisma -g
RUN npx prisma generate

COPY . .

RUN npm run build

# Étape de production (ajoutez explicitement 'AS production')
FROM node:18-alpine AS production 

WORKDIR /usr/src/app

COPY .env .
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma

RUN apk add --no-cache tini && \
    addgroup -S app && \
    adduser -S app -G app && \
    chown -R app:app .

USER app

EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "--"]
CMD npx prisma migrate deploy && node dist/server.js