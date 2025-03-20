import { Router } from "express";
import { userController } from "../controllers/usersController.js";

export const userRouter = Router();

userRouter.get("/");
userRouter.get("/all");
userRouter.patch("/update/:id", userController.updateExistentUser);
userRouter.delete("/delete/:id", userController.deleteExistentUser);
