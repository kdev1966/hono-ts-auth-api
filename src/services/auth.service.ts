// src/services/auth.service.ts

import prisma from "../prisma/client.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { logger } from "../utils/logger.js";
enum Role {
  ETUDIANT = "ETUDIANT",
  ENCADRANT = "ENCADRANT",
  // Add other roles if necessary
}

dotenv.config();
const jwtSecret = process.env.JWT_SECRET as string;
const saltRounds = 10;

export const registerUser = async (
  username: string,
  email: string,
  password: string,
  role: Role = Role.ETUDIANT // Valeur par défaut
) => {
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  try {
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role,
      },
    });
    return user;
  } catch (error) {
    logger.error("Erreur lors de la création de l'utilisateur", error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return null;
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return null;
  }
  const token = jwt.sign({ id: user.id, email: user.email }, jwtSecret, {
    expiresIn: "1h",
  });
  return token;
};
