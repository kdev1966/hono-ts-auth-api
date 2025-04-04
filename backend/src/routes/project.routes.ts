import { Hono } from "hono";
import {
  createProjectController,
  getAllProjectsController,
  updateProjectController,
  deleteProjectController,
} from "../controllers/project.controller.js";

const projectRoutes = new Hono();

projectRoutes.post("/projects", createProjectController);
projectRoutes.get("/projects", getAllProjectsController);
projectRoutes.put("/projects/:id", updateProjectController);
projectRoutes.delete("/projects/:id", deleteProjectController);

export default projectRoutes;
