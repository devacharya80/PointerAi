import express from "express";
const userRoute = express.Router()
import { validateUser } from "../../middleware/auth.middleware.js";
import { getUserController } from "./user.controller.js";

userRoute.get("/",validateUser,getUserController)
userRoute.patch("/",validateUser)
userRoute.delete("/",validateUser)

export default userRoute;