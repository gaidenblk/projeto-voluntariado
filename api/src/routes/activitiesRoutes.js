import { Router } from "express";

export const activitiesRouter = Router();

activitiesRouter.get("/list");
activitiesRouter.get("/:user_id/list");
activitiesRouter.post("/create");
activitiesRouter.patch("/:atividade_id/");
activitiesRouter.delete("/:atividade_id/");
activitiesRouter.post("/:atividade_id/subscribe");
activitiesRouter.delete("/:atividade_id/unsubscribe");
