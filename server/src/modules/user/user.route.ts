import express from "express";
const userRoute = express.Router()
import { validateUser } from "../../middleware/auth.middleware.js";
import { getUserController, updateUserController,  } from "./user.controller.js";

userRoute.get("/",validateUser,getUserController)
userRoute.patch("/",validateUser,updateUserController)
// userRoute.delete("/",validateUser,deleteUserController)

export default userRoute;