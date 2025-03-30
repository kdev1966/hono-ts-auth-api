// src/app.ts

import { Hono } from "hono";
import authRoutes from "./routes/auth.routes.js";
import swaggerRoutes from "./routes/swagger.routes.js";
import { loggerMiddleware } from "./middlewares/logger.middleware.js";

const app = new Hono();

// Ajout du middleware de log global
app.use("*", loggerMiddleware);

// Montage des routes d’authentification
app.route("/auth", authRoutes);

// Montage des routes Swagger sous /swagger
app.route("/swagger", swaggerRoutes);

export default app;
