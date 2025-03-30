// src/server.ts

import app from "./app.js";
import dotenv from "dotenv";
import { logger } from "./utils/logger.js";
import { serve } from "@hono/node-server";

dotenv.config();
const port = process.env.PORT || 3000;

serve(
  {
    fetch: app.fetch,
    port: Number(port),
  },
  () => {
    logger.info(`Serveur Hono démarré sur le port ${port}`);
  }
);
