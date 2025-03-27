// src/controllers/auth.controller.ts

import { Context } from "hono";
import { registerUser, loginUser, Role } from "../services/auth.service.js";
import { z } from "zod";
import { logger } from "../utils/logger.js";

interface CustomContext extends Context {
  req: {
    user?: any;
  } & Context["req"];
}

// Schémas de validation avec Zod
const registerSchema = z.object({
  username: z.string().min(3, "Username doit contenir au moins 3 caractères"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Password doit contenir au moins 6 caractères"),
  role: z.enum([Role.ETUDIANT, Role.ENCADRANT]).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const registerController = async (c: Context) => {
  try {
    const payload = await c.req.json();
    const validatedData = registerSchema.parse(payload);

    // Utiliser la valeur par défaut de l'enum si non spécifié
    const role = validatedData.role || Role.ETUDIANT;

    const user = await registerUser(
      validatedData.username,
      validatedData.email,
      validatedData.password,
      role
    );

    return c.json(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      201
    );
  } catch (error: any) {
    logger.error("Erreur dans registerController", error);

    if (error instanceof z.ZodError) {
      return c.json(
        {
          error: "Validation failed",
          details: error.errors,
        },
        400
      );
    }

    return c.json(
      {
        error: error?.message || "Erreur lors de l'inscription",
      },
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

    if (error instanceof z.ZodError) {
      return c.json(
        {
          error: "Validation failed",
          details: error.errors,
        },
        400
      );
    }

    return c.json(
      {
        error: error?.message || "Erreur lors de la connexion",
      },
      400
    );
  }
};

export const profileController = async (c: CustomContext) => {
  // Vérifier si l'utilisateur est authentifié
  if (!c.req.user) {
    return c.json({ error: "Non authentifié" }, 401);
  }

  // Retourner un profil sécurisé sans informations sensibles
  return c.json({
    profile: {
      id: c.req.user.id,
      username: c.req.user.username,
      email: c.req.user.email,
      role: c.req.user.role,
    },
  });
};
