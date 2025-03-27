// src/middlewares/logger.middleware.ts

import { Context, Next } from "hono";
import { logger } from "../utils/logger.js";

export const loggerMiddleware = async (c: Context, next: Next) => {
  const { method, url } = c.req;
  logger.info(`Requête entrante: ${method} ${url}`);
  try {
    await next();
  } catch (error) {
    logger.error(`Erreur lors du traitement de ${method} ${url}`, error);
    throw error;
  }
};
