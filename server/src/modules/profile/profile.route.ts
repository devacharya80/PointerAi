import express from "express";
const profileRoute = express.Router()
import { profileController } from "./profile.controller.js";
import { validateUser } from "../../middleware/auth.middleware.js";

profileRoute.patch("/",validateUser,profileController)

export default profileRoute;