// src/controllers/auth.controller.ts

import { Context } from "hono";
import { registerUser, loginUser } from "../services/auth.service.js";

interface CustomContext extends Context {
  req: {
    user?: any;
  } & Context["req"];
}
import { z } from "zod";
import { logger } from "../utils/logger.js";

// Schémas de validation avec Zod
const registerSchema = z.object({
  username: z.string().min(3, "Username doit contenir au moins 3 caractères"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Password doit contenir au moins 6 caractères"),
  role: z.string().optional(),
});

const loginSchema = z.object({
  username: z.string().optional(),
  email: z.string().email(),
  password: z.string(),
  role: z.string().optional(),
});

export const registerController = async (c: Context) => {
  try {
    const payload = await c.req.json();
    const validatedData = registerSchema.parse(payload);
    const user = await registerUser(
      validatedData.username,
      validatedData.email,
      validatedData.password,
      validatedData.role || "user"
    );
    return c.json({ user });
  } catch (error: any) {
    logger.error("Erreur dans registerController", error);
    return c.json(
      { error: error?.errors ? error.errors : "Erreur lors de l'inscription" },
      400
    );
  }
};

export const loginController = async (c: Context) => {
  try {
    const payload = await c.req.json();
    const validatedData = loginSchema.parse(payload);
    const token = await loginUser(validatedData.email, validatedData.password);
    if (!token) {
      return c.json({ error: "Identifiants invalides" }, 401);
    }
    return c.json({ token });
  } catch (error: any) {
    logger.error("Erreur dans loginController", error);
    return c.json(
      { error: error?.errors ? error.errors : "Erreur lors de la connexion" },
      400
    );
  }
};

export const profileController = async (c: CustomContext) => {
  // L'utilisateur est injecté par authMiddleware
  return c.json({ profile: c.req.user });
};
