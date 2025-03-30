// src/controllers/project.controller.ts

import { Context } from "hono";
import prisma from "../prisma/client.js";
import { Prisma } from "@prisma/client";

// Enumération des statuts des projets
export enum ProjectStatus {
  EN_COURS = "EN_COURS",
  TERMINE = "TERMINE",
  ANNULE = "ANNULE",
}

// Fonction pour créer un projet
export const createProjectController = async (c: Context) => {
  const { title, description, status } = await c.req.json();

  // Valider que title et description sont présents
  if (!title || !description) {
    return c.json({ error: "Title and description are required." }, 400);
  }

  // Valider que le statut est valide
  const projectStatus = Object.values(ProjectStatus).includes(status)
    ? status
    : ProjectStatus.EN_COURS; // Utiliser le statut par défaut si non valide

  const project = await prisma.project.create({
    data: {
      title,
      description,
      status: projectStatus, // Assigner le statut validé
      user: {
        connect: {
          id: c.req.user.id, // Associer l'utilisateur
        },
      },
    },
  });

  return c.json(project, 201);
};

// Obtenir tous les projets
export const getAllProjectsController = async (c: Context) => {
  const projects = await prisma.project.findMany();

  return c.json(projects);
};

// Supprimer un projet
export const deleteProjectController = async (c: Context) => {
  const projectId = c.req.param("id"); // Utiliser directement l'ID en tant que string

  // Vérifier si le projet existe
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    return c.json({ error: "Project not found." }, 404);
  }

  // Supprimer le projet
  await prisma.project.delete({
    where: { id: projectId },
  });

  return c.json({ message: "Project deleted successfully." }, 200);
};

// Mettre à jour un projet
export const updateProjectController = async (c: Context) => {
  const projectId = c.req.param("id"); // Utiliser directement l'ID en tant que string
  const { title, description, status } = await c.req.json();

  // Valider que title et description sont présents
  if (!title || !description) {
    return c.json({ error: "Title and description are required." }, 400);
  }

  // Valider que le statut est valide
  const projectStatus = Object.values(ProjectStatus).includes(status)
    ? status
    : ProjectStatus.EN_COURS;

  const project = await prisma.project.update({
    where: { id: projectId },
    data: {
      title,
      description,
      status: projectStatus, // Assigner le statut validé
    },
  });

  return c.json(project);
};
