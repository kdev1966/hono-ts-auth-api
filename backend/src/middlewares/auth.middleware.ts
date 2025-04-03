// src/middlewares/auth.middleware.ts

import { Context, Next } from "hono";
import jwt from "jsonwebtoken";
import { logger } from "../utils/logger.js";
import dotenv from "dotenv";
import { Role } from "@prisma/client";

dotenv.config();
const jwtSecret = process.env.JWT_SECRET as string;

declare module "hono" {
  interface HonoRequest {
    user?: any;
  }
}

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header("authorization");
  if (!authHeader) {
    logger.error("Token manquant");
    return c.json({ error: "Token manquant" }, 401);
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, jwtSecret);
    c.req["user"] = decoded;
    await next();
  } catch (err) {
    logger.error("Token invalide", err);
    return c.json({ error: "Token invalide" }, 401);
  }
};

export const checkRoleMiddleware = (requiredRole: Role) => {
  return async (c: Context, next: Next) => {
    if (c.req.user?.role !== requiredRole) {
      return c.json({ error: "Accès interdit : rôle insuffisant" }, 403);
    }
    await next();
  };
};
