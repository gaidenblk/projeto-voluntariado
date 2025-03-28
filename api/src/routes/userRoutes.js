import { Router } from "express";
import { userController } from "../controllers/usersController.js";
import { activitiesController } from "../controllers/activitiesController.js";

export const userRouter = Router();

userRouter.get("/", userController.listUser);
userRouter.patch("/update/:id", userController.updateExistentUser);
userRouter.delete("/delete/:id", userController.deleteExistentUser);
userRouter.get("/activities/list", activitiesController.listAvailableActivities);
userRouter.get("/activities/:usuario_id/list", userController.listSubscribedActivities);
userRouter.post("/activities/:atividade_id/subscribe", userController.subscribeToActivity);
userRouter.delete("/activities/:atividade_id/unsubscribe", userController.unsubscribeActivity);
