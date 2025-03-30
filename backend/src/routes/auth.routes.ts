// src/routes/auth.routes.ts

import { Hono } from "hono";
import {
  registerController,
  loginController,
  profileController,
  updateProfileController,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const authRoutes = new Hono();

authRoutes.post("/register", registerController);
authRoutes.post("/login", loginController);
authRoutes.get("/profile", authMiddleware, profileController);
authRoutes.put("/profile", authMiddleware, updateProfileController);

export default authRoutes;
