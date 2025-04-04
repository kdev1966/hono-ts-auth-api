// src/middlewares/auth.middleware.ts

import { Context, Next } from "hono";
import { jwt } from "hono/jwt";
import { Crypto } from "@peculiar/webcrypto";
import dotenv from "dotenv";
import { Role } from "@prisma/client";

dotenv.config();
// Réinitialisation explicite
(globalThis as any).crypto = new Crypto();

declare module "hono" {
  interface HonoRequest {
    user?: any;
  }
}

export const authMiddleware = jwt({
  secret: process.env.JWT_SECRET!, // Ajout du ! pour TypeScript
  alg: "HS256",
  cookie: "token",
});

// Ajouter une vérification explicite
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET non défini dans les variables d'environnement");
}

export const checkRoleMiddleware = (requiredRole: Role) => {
  return async (c: Context, next: Next) => {
    if (c.req.user?.role !== requiredRole) {
      return c.json({ error: "Accès interdit : rôle insuffisant" }, 403);
    }
    await next();
  };
};
