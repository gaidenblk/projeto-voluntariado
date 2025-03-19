import { Router } from "express";

export const userRouter = Router();

userRouter.get("/");
userRouter.get("/all");
userRouter.post("/login");
userRouter.delete("/logout");
userRouter.post("/register");
userRouter.patch("/update");
