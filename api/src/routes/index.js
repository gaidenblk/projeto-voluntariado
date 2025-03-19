import { Router } from "express";
import { userRouter } from "./userRoutes.js";
import { activitiesRouter } from "./activitiesRoutes.js";

export const routes = Router();

routes.use("/user", userRouter);
routes.use("/activities", activitiesRouter);
