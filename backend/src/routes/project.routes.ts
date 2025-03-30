import { Hono } from "hono";
import {
  createProjectController,
  updateProjectController,
  deleteProjectController,
} from "../controllers/project.controller";

const projectRoutes = new Hono();

projectRoutes.post("/projects", createProjectController);
projectRoutes.put("/projects/:id", updateProjectController);
projectRoutes.delete("/projects/:id", deleteProjectController);

export default projectRoutes;
