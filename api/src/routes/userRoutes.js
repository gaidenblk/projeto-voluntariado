import { Router } from "express";
import { userController } from "../controllers/usersController.js";
import { activitiesController } from "../controllers/activitiesController.js";

export const userRouter = Router();

userRouter.get("/", userController.listUser);
userRouter.get("/:usuario_id", userController.findUserById);
userRouter.patch("/:usuario_id/update", userController.updateExistentUser);
userRouter.delete("/:usuario_id/delete", userController.deleteExistentUser);
userRouter.get("/activities/list", activitiesController.listAvailableActivities);
userRouter.get("/:usuario_id/activities/list", userController.listSubscribedActivities);

userRouter.post(
	"/:usuario_id/activities/:atividade_id/subscribe",
	userController.subscribeToActivity,
);
userRouter.delete(
	"/:usuario_id/activities/:atividade_id/unsubscribe",
	userController.unsubscribeActivity,
);
