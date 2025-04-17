import { Router } from "express";
import { activitiesController } from "../controllers/activitiesController.js";

export const activitiesRouter = Router();

activitiesRouter.post("/create", activitiesController.createNewActivity);
activitiesRouter.get("/list", activitiesController.listAllWithUsers);
activitiesRouter.get("/users", activitiesController.listUsersWithActivities);
activitiesRouter.patch("/update/:atividade_id", activitiesController.updateActivity);
activitiesRouter.delete("/delete/:atividade_id", activitiesController.deleteActivity);
