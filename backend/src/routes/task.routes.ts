import { Hono } from "hono";

import {
  createTaskController,
  getAllTasksController,
  //updateTaskController,
  //deleteTaskController,
} from "../controllers/task.controller.js";

const taskRouter = new Hono();

taskRouter.post("/tasks", createTaskController);
taskRouter.get("/tasks", getAllTasksController);
//taskRouter.put("/tasks/:id", updateTaskController);
//taskRouter.delete("/tasks/:id", deleteTaskController);

export default taskRouter;
