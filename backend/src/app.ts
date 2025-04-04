// src/app.ts

import { Hono } from "hono";
import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.routes.js";
//import documentRoutes from "./routes/document.routes.js";
//import commentRoutes from "./routes/comment.routes.js";
//import meetingRoutes from "./routes/meeting.routes.js";
//import milestoneRoutes from "./routes/milestone.routes.js";
//import notificationRoutes from "./routes/notification.routes.js";
import swaggerRoutes from "./routes/swagger.routes.js";
import { loggerMiddleware } from "./middlewares/logger.middleware.js";
import { authMiddleware } from "./middlewares/auth.middleware.js";

const app = new Hono();

// Ajout du middleware de log global
app.use("*", loggerMiddleware);

// Routes publiques
app.route("/auth", authRoutes);
app.route("/swagger", swaggerRoutes);

// Routes protégées par authentification
app.use("/api/*", authMiddleware);
app.route("/api", projectRoutes);
app.route("/api", taskRoutes);
//app.route("/api", documentRoutes);
//app.route("/api", commentRoutes);
//app.route("/api", meetingRoutes);
//app.route("/api", milestoneRoutes);
//app.route("/api", notificationRoutes);

export default app;
