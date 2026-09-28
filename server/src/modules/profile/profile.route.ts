import express from "express";
const profileRoute = express.Router()
import { updateProfileController, getProfileController } from "./profile.controller.js";
import { validateUser } from "../../middleware/auth.middleware.js";

profileRoute.get("/",validateUser,getProfileController)
profileRoute.patch("/",validateUser,updateProfileController)

export default profileRoute;