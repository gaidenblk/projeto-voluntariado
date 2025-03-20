import { Router } from "express";
import { authRouter } from "./authRoutes.js";
import { userRouter } from "./userRoutes.js";
import { activitiesRouter } from "./activitiesRoutes.js";
import { permissionVerify } from "../middleware/permissionVerify.js";

export const routes = Router();

routes.get("/", (req, res) => {
	res.send("Tamo Vivo!");
});

routes.use("/auth", authRouter);
routes.use("/user", permissionVerify, userRouter);
routes.use("/activities", permissionVerify, activitiesRouter);
