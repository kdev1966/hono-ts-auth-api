// src/controllers/task.controller.ts

import { Context } from "hono";
import prisma from "../prisma/client.js";
import { logger } from "../utils/logger.js";
import { TaskStatus } from "@prisma/client";

// Créer une tâche
export const createTaskController = async (c: Context) => {
  try {
    const {
      title,
      description,
      status,
      dueDate,
      priority,
      projectId,
      assigneeIds,
    } = await c.req.json();

    // Valider les données de la tâche
    if (!title || !description || !dueDate || !projectId) {
      return c.json(
        { error: "Title, description, due date, and project ID are required." },
        400
      );
    }

    // Vérifier que le projet existe
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        supervisors: true,
      },
    });

    if (!project) {
      return c.json({ error: "Project not found." }, 404);
    }

    // Vérifier que l'utilisateur est autorisé à créer une tâche pour ce projet
    const userId = c.req.user.id;
    const userRole = c.req.user.role;
    const isOwner = project.userId === userId;
    const isSupervisor = project.supervisors.some(
      (s) => s.supervisorId === userId
    );

    if (userRole !== "ADMIN" && !isOwner && !isSupervisor) {
      return c.json(
        { error: "You are not authorized to create tasks for this project." },
        403
      );
    }

    // Valider le statut de la tâche
    const taskStatus = Object.values(TaskStatus).includes(status as TaskStatus)
      ? status
      : TaskStatus.PENDANT;

    // Créer la tâche
    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: taskStatus,
        dueDate: new Date(dueDate),
        priority: priority || 1,
        projectId,
      },
    });

    // Assigner des utilisateurs à la tâche si spécifiés
    if (assigneeIds && Array.isArray(assigneeIds) && assigneeIds.length > 0) {
      await Promise.all(
        assigneeIds.map((assigneeId: number) =>
          prisma.taskAssignment.create({
            data: {
              taskId: task.id,
              userId: assigneeId,
            },
          })
        )
      );

      // Créer des notifications pour les assignés
      await Promise.all(
        assigneeIds.map((assigneeId: number) =>
          prisma.notification.create({
            data: {
              title: "Nouvelle tâche assignée",
              content: `Vous avez été assigné à la tâche "${task.title}" dans le projet "${project.title}".`,
              userId: assigneeId,
            },
          })
        )
      );
    }

    return c.json(
      {
        task,
        message: "Task created successfully.",
      },
      201
    );
  } catch (error) {
    logger.error("Error creating task", error);
    return c.json({ error: "Failed to create task." }, 500);
  }
};

// Obtenir toutes les tâches d'un projet
export const getProjectTasksController = async (c: Context) => {
  try {
    const projectId = c.req.param("id");
    const status = c.req.query("status");

    // Construire la clause where
    let whereClause: any = { projectId };

    // Filtrer par statut si spécifié
    if (status && Object.values(TaskStatus).includes(status as TaskStatus)) {
      whereClause.status = status;
    }

    // Récupérer les tâches
    const tasks = await prisma.task.findMany({
      where: whereClause,
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
        _count: {
          select: {
            comments: true,
            documents: true,
          },
        },
      },
      orderBy: [{ status: "asc" }, { priority: "desc" }, { dueDate: "asc" }],
    });

    return c.json({ tasks });
  } catch (error) {
    logger.error("Error fetching project tasks", error);
    return c.json({ error: "Failed to fetch project tasks." }, 500);
  }
};

interface TaskResponse {
  tasks: Array<any>;
  error?: string;
}

export const getAllTasksController = async (c: Context): Promise<Response> => {
  try {
    const tasks = await prisma.task.findMany();
    return c.json({ tasks } satisfies TaskResponse);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return c.json(
      { tasks: [], error: errorMessage } satisfies TaskResponse,
      500
    );
  }
};

// Obtenir les détails d'une tâche
export const getTaskDetailsController = async (c: Context) => {
  try {
    const taskId = c.req.param("id");
    const task = await prisma.task.findUnique({
      where: { id: taskId },
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
        project: {
          select: {
            id: true,
            title: true,
            description: true,
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
      },
    });

    if (!task) {
      return c.json({ error: "Task not found" }, 404);
    }

    return c.json({ task });
  } catch (error) {
    logger.error("Error fetching task details", error);
    return c.json({ error: "Failed to fetch task details." }, 500);
  }
};
