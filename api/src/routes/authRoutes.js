import { Router } from "express";
import { authController } from "../controllers/authController.js";
import { userController } from "../controllers/usersController.js";

export const authRouter = Router();
authRouter.get("/validate", authController.validateToken);
authRouter.post("/login", authController.authenticate);
authRouter.delete("/logout", authController.logout);

authRouter.post("/register", userController.createNewUser);
