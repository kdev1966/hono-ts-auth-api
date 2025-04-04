// src/server.ts

import { Crypto } from "@peculiar/webcrypto";
// Initialisation explicite pour Node.js
if (!globalThis.crypto) {
  (globalThis as any).crypto = new Crypto();
}
import app from "./app.js";
import dotenv from "dotenv";
import { logger } from "./utils/logger.js";
import { serve } from "@hono/node-server";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration du chemin .env
const envPath = resolve(
  __dirname,
  process.env.NODE_ENV === "production" ? "../.env" : "../.env.dev"
);
dotenv.config({ path: envPath });

const port = process.env.PORT || 3000;

serve(
  {
    fetch: app.fetch,
    port: Number(port),
  },
  () => {
    logger.info(`Serveur Hono démarré sur le port ${port}`);
    logger.info(`Environnement: ${process.env.NODE_ENV}`);
    logger.info(`Database URL: ${process.env.DATABASE_URL}`);
  }
);
