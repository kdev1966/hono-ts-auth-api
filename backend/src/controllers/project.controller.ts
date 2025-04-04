// src/controllers/project.controller.ts

import { Context } from "hono";
import prisma from "../prisma/client.js";
import { logger } from "../utils/logger.js";
import { ProjectStatus } from "@prisma/client";

// Fonction pour créer un projet
export const createProjectController = async (c: Context) => {
  try {
    const { title, description, status, supervisorIds } = await c.req.json();

    // Valider que title et description sont présents
    if (!title || !description) {
      return c.json({ error: "Title and description are required." }, 400);
    }

    // Valider que le statut est valide
    const projectStatus = Object.values(ProjectStatus).includes(
      status as ProjectStatus
    )
      ? status
      : ProjectStatus.EN_COURS;

    // Créer le projet
    const project = await prisma.project.create({
      data: {
        title,
        description,
        status: projectStatus,
        userId: c.req.user.id,
      },
    });

    // Ajouter les encadrants si spécifiés
    if (
      supervisorIds &&
      Array.isArray(supervisorIds) &&
      supervisorIds.length > 0
    ) {
      await Promise.all(
        supervisorIds.map((supervisorId: number) =>
          prisma.projectSupervisor.create({
            data: {
              projectId: project.id,
              supervisorId,
            },
          })
        )
      );
    }

    return c.json(
      {
        project,
        message: "Project created successfully.",
      },
      201
    );
  } catch (error) {
    logger.error("Error creating project", error);
    return c.json({ error: "Failed to create project." }, 500);
  }
};

// Obtenir tous les projets (avec filtres)
export const getAllProjectsController = async (c: Context) => {
  try {
    const userId = c.req.user.id;
    const role = c.req.user.role;
    const status = c.req.query("status");
    const search = c.req.query("search");

    let whereClause: any = {};

    // Filtrer par statut si spécifié
    if (
      status &&
      Object.values(ProjectStatus).includes(status as ProjectStatus)
    ) {
      whereClause.status = status;
    }

    // Recherche par titre ou description
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Pour les étudiants: voir seulement leurs propres projets
    if (role === "ETUDIANT") {
      whereClause.userId = userId;
    }
    // Pour les encadrants: voir leurs projets supervisés aussi
    else if (role === "ENCADRANT") {
      whereClause.OR = [
        { userId: userId },
        { supervisors: { some: { supervisorId: userId } } },
      ];
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
          },
        },
        supervisors: {
          include: {
            supervisor: {
              select: {
                id: true,
                username: true,
                email: true,
                role: true,
              },
            },
          },
        },
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            dueDate: true,
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
        documents: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return c.json({ projects });
  } catch (error) {
    logger.error("Error fetching projects", error);
    return c.json({ error: "Failed to fetch projects." }, 500);
  }
};

// Obtenir un projet spécifique
export const getProjectByIdController = async (c: Context) => {
  try {
    const projectId = c.req.param("id");

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
          },
        },
        supervisors: {
          include: {
            supervisor: {
              select: {
                id: true,
                username: true,
                email: true,
                role: true,
              },
            },
          },
        },
        tasks: {
          include: {
            assignments: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    email: true,
                    role: true,
                  },
                },
              },
            },
          },
        },
        documents: {
          select: {
            id: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        meetingNotes: {
          orderBy: {
            date: "desc",
          },
        },
        milestones: {
          orderBy: {
            dueDate: "asc",
          },
        },
      },
    });

    if (!project) {
      return c.json({ error: "Project not found." }, 404);
    }

    // Vérifier que l'utilisateur a accès à ce projet
    const userId = c.req.user.id;
    const userRole = c.req.user.role;
    const isOwner = project.userId === userId;
    const isSupervisor = project.supervisors.some(
      (s) => s.supervisorId === userId
    );

    if (userRole !== "ADMIN" && !isOwner && !isSupervisor) {
      return c.json({ error: "You do not have access to this project." }, 403);
    }

    // Calculer les statistiques du projet
    const completedTasks = project.tasks.filter(
      (task) => task.status === "TERMINÉ"
    ).length;
    const totalTasks = project.tasks.length;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return c.json({
      project,
      stats: {
        completedTasks,
        totalTasks,
        progress: Math.round(progress),
      },
    });
  } catch (error) {
    logger.error("Error fetching project details", error);
    return c.json({ error: "Failed to fetch project details." }, 500);
  }
};

// Mettre à jour un projet
export const updateProjectController = async (c: Context) => {
  try {
    const projectId = c.req.param("id");
    const { title, description, status, supervisorIds } = await c.req.json();

    // Valider que title et description sont présents
    if (!title || !description) {
      return c.json({ error: "Title and description are required." }, 400);
    }

    // Vérifier que le projet existe
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        supervisors: true,
      },
    });

    if (!existingProject) {
      return c.json({ error: "Project not found." }, 404);
    }

    // Vérifier que l'utilisateur est autorisé à modifier ce projet
    const userId = c.req.user.id;
    const userRole = c.req.user.role;
    const isOwner = existingProject.userId === userId;
    const isSupervisor = existingProject.supervisors.some(
      (s) => s.supervisorId === userId
    );

    if (userRole !== "ADMIN" && !isOwner && !isSupervisor) {
      return c.json(
        { error: "You are not authorized to update this project." },
        403
      );
    }

    // Valider que le statut est valide
    const projectStatus = Object.values(ProjectStatus).includes(
      status as ProjectStatus
    )
      ? status
      : existingProject.status;

    // Mettre à jour le projet
    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        title,
        description,
        status: projectStatus,
      },
    });

    // Mettre à jour les encadrants si spécifiés
    if (supervisorIds && Array.isArray(supervisorIds)) {
      // Supprimer les encadrants actuels
      await prisma.projectSupervisor.deleteMany({
        where: { projectId },
      });

      // Ajouter les nouveaux encadrants
      if (supervisorIds.length > 0) {
        await Promise.all(
          supervisorIds.map((supervisorId: number) =>
            prisma.projectSupervisor.create({
              data: {
                projectId,
                supervisorId,
              },
            })
          )
        );
      }
    }

    // Créer une notification pour le propriétaire du projet
    if (!isOwner) {
      await prisma.notification.create({
        data: {
          title: "Mise à jour du projet",
          content: `Votre projet "${project.title}" a été mis à jour par ${c.req.user.username}.`,
          userId: existingProject.userId,
        },
      });
    }

    return c.json({
      project,
      message: "Project updated successfully.",
    });
  } catch (error) {
    logger.error("Error updating project", error);
    return c.json({ error: "Failed to update project." }, 500);
  }
};

// Supprimer un projet
export const deleteProjectController = async (c: Context) => {
  try {
    const projectId = c.req.param("id");

    // Vérifier que le projet existe
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!existingProject) {
      return c.json({ error: "Project not found." }, 404);
    }

    // Vérifier que l'utilisateur est autorisé à supprimer ce projet
    const userId = c.req.user.id;
    const userRole = c.req.user.role;
    const isOwner = existingProject.userId === userId;

    if (userRole !== "ADMIN" && !isOwner) {
      return c.json(
        { error: "You are not authorized to delete this project." },
        403
      );
    }

    // Supprimer en cascade toutes les entités liées
    await prisma.$transaction([
      prisma.projectSupervisor.deleteMany({ where: { projectId } }),
      prisma.comment.deleteMany({ where: { projectId } }),
      prisma.document.deleteMany({ where: { projectId } }),
      prisma.taskAssignment.deleteMany({
        where: { task: { projectId } },
      }),
      prisma.task.deleteMany({ where: { projectId } }),
      prisma.meetingNote.deleteMany({ where: { projectId } }),
      prisma.milestone.deleteMany({ where: { projectId } }),
      prisma.project.delete({ where: { id: projectId } }),
    ]);

    return c.json({ message: "Project deleted successfully." }, 200);
  } catch (error) {
    logger.error("Error deleting project", error);
    return c.json({ error: "Failed to delete project." }, 500);
  }
};

// Ajouter un encadrant à un projet
export const addSupervisorController = async (c: Context) => {
  try {
    const projectId = c.req.param("id");
    const { supervisorId } = await c.req.json();

    if (!supervisorId) {
      return c.json({ error: "Supervisor ID is required." }, 400);
    }

    // Vérifier que le projet existe
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return c.json({ error: "Project not found." }, 404);
    }

    // Vérifier que l'utilisateur est autorisé à ajouter un encadrant
    const userId = c.req.user.id;
    const userRole = c.req.user.role;
    const isOwner = project.userId === userId;

    if (userRole !== "ADMIN" && !isOwner) {
      return c.json(
        { error: "You are not authorized to add supervisors to this project." },
        403
      );
    }

    // Vérifier que l'encadrant existe et a le rôle ENCADRANT
    const supervisor = await prisma.user.findUnique({
      where: { id: supervisorId },
    });

    if (!supervisor || supervisor.role !== "ENCADRANT") {
      return c.json({ error: "Invalid supervisor." }, 400);
    }

    // Vérifier si l'encadrant est déjà associé au projet
    const existingSupervisor = await prisma.projectSupervisor.findFirst({
      where: {
        projectId,
        supervisorId,
      },
    });

    if (existingSupervisor) {
      return c.json(
        { error: "Supervisor already assigned to this project." },
        400
      );
    }

    // Ajouter l'encadrant au projet
    const projectSupervisor = await prisma.projectSupervisor.create({
      data: {
        projectId,
        supervisorId,
      },
      include: {
        supervisor: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    // Créer une notification pour l'encadrant
    await prisma.notification.create({
      data: {
        title: "Nouveau projet à encadrer",
        content: `Vous avez été ajouté comme encadrant au projet "${project.title}".`,
        userId: supervisorId,
      },
    });

    return c.json({
      message: "Supervisor added successfully.",
      supervisor: projectSupervisor.supervisor,
    });
  } catch (error) {
    logger.error("Error adding supervisor", error);
    return c.json({ error: "Failed to add supervisor." }, 500);
  }
};

// Supprimer un encadrant d'un projet
export const removeSupervisorController = async (c: Context) => {
  try {
    const projectId = c.req.param("id");
    const supervisorId = parseInt(c.req.param("supervisorId"));

    // Vérifier que le projet existe
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return c.json({ error: "Project not found." }, 404);
    }

    // Vérifier que l'utilisateur est autorisé à supprimer un encadrant
    const userId = c.req.user.id;
    const userRole = c.req.user.role;
    const isOwner = project.userId === userId;

    if (userRole !== "ADMIN" && !isOwner) {
      return c.json(
        {
          error:
            "You are not authorized to remove supervisors from this project.",
        },
        403
      );
    }

    // Supprimer l'encadrant du projet
    await prisma.projectSupervisor.deleteMany({
      where: {
        projectId,
        supervisorId,
      },
    });

    return c.json({
      message: "Supervisor removed successfully.",
    });
  } catch (error) {
    logger.error("Error removing supervisor", error);
    return c.json({ error: "Failed to remove supervisor." }, 500);
  }
};

// Récupérer les statistiques d'un projet
export const getProjectStatsController = async (c: Context) => {
  try {
    const projectId = c.req.param("id");

    // Vérifier que le projet existe
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        tasks: {
          select: {
            status: true,
          },
        },
        documents: {
          select: {
            id: true,
          },
        },
        comments: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!project) {
      return c.json({ error: "Project not found." }, 404);
    }

    // Calculer les statistiques
    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter(
      (task) => task.status === "TERMINÉ"
    ).length;
    const pendingTasks = project.tasks.filter(
      (task) => task.status === "PENDANT"
    ).length;
    const inProgressTasks = project.tasks.filter(
      (task) => task.status === "EN_COURS"
    ).length;
    const lateTasks = project.tasks.filter(
      (task) => task.status === "EN_RETARD"
    ).length;

    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return c.json({
      stats: {
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        lateTasks,
        progress: Math.round(progress),
        documentsCount: project.documents.length,
        commentsCount: project.comments.length,
      },
    });
  } catch (error) {
    logger.error("Error fetching project statistics", error);
    return c.json({ error: "Failed to fetch project statistics." }, 500);
  }
};
