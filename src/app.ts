// src/app.ts

import { Hono } from "hono";
import authRoutes from "./routes/auth.routes.js";
import { loggerMiddleware } from "./middlewares/logger.middleware.js";

const app = new Hono();

// Ajout du middleware de log global
app.use("*", loggerMiddleware);

// Montage des routes d’authentification
app.route("/auth", authRoutes);

export default app;
