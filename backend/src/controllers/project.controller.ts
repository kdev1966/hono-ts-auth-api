// src/controllers/project.controller.ts

import { Context } from "hono";
import prisma from "../prisma/client.js";

export const createProjectController = async (c: Context) => {
  const { title, description } = await c.req.json();

  // Valider les données avec Zod ou une autre méthode si nécessaire
  if (!title || !description) {
    return c.json({ error: "Title and description are required." }, 400);
  }

  const project = await prisma.project.create({
    data: {
      title,
      description,
      status: "PENDING", // Add default status
      user: {
        connect: {
          id: c.req.user.id,
        },
      },
    },
  });

  return c.json(project, 201);
};

// Récupérer tous les projets
export const deleteProjectController = async (c: Context) => {
  const projectId = parseInt(c.req.param("id"));

  // Vérifier si le projet existe
  const project = await prisma.project.findUnique({
    where: { id: projectId.toString() },
  });

  if (!project) {
    return c.json({ error: "Project not found." }, 404);
  }

  // Supprimer le projet
  await prisma.project.delete({
    where: { id: projectId.toString() },
  });

  return c.json({ message: "Project deleted successfully." }, 200);
};

// Mettre à jour un projet
export const updateProjectController = async (c: Context) => {
  const projectId = parseInt(c.req.param("id"));
  const { title, description } = await c.req.json();

  // Valider les données avec Zod ou une autre méthode si nécessaire
  if (!title || !description) {
    return c.json({ error: "Title and description are required." }, 400);
  }

  const project = await prisma.project.update({
    where: { id: projectId.toString() },
    data: {
      title,
      description,
    },
  });

  return c.json(project);
};
