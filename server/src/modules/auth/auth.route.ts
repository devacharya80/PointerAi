import express from 'express';
import passport from "passport";
const authRoute = express.Router()

import { registerController,loginController, refreshController, logoutController, googleCallbackController } from './auth.controller.js';

import { validateUser } from "../../middleware/auth.middleware.js";

authRoute.post("/register",registerController)
authRoute.post("/login",loginController)
authRoute.post("/refresh",refreshController)
authRoute.post("/logout",logoutController)
authRoute.get("/google", passport.authenticate("google", { 
  scope: ["profile", "email"],
  session: false 
}));

authRoute.get("/google/callback", 
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  googleCallbackController
);

authRoute.get("/me", validateUser, (req, res) => {
  res.status(200).json({ user: req.user });
});

export default authRoute