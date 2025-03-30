import { Router } from "express";
import { activitiesController } from "../controllers/activitiesController.js";

export const activitiesRouter = Router();

activitiesRouter.post("/create", activitiesController.createNewActivity);
activitiesRouter.get("/all", activitiesController.listAll);
activitiesRouter.get("/list", activitiesController.listActivities);
activitiesRouter.patch("/update/:atividade_id", activitiesController.updateActivity);
activitiesRouter.delete("/delete/:atividade_id", activitiesController.deleteActivity);
