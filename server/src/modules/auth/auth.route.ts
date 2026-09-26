import express from "express";
import passport from "passport";
const authRoute = express.Router();

import {
  registerController,
  loginController,
  refreshController,
  logoutController,
  googleCallbackController,
} from "./auth.controller.js";

import { validateUser } from "../../middleware/auth.middleware.js";

import { authRateLimitMiddleware } from "../../middleware/rateLimit.middleware.js";

authRoute.post("/register", authRateLimitMiddleware, registerController);
authRoute.post("/login", authRateLimitMiddleware, loginController);
authRoute.post("/refresh", authRateLimitMiddleware, refreshController);
authRoute.post("/logout", authRateLimitMiddleware, logoutController);
authRoute.get(
  "/google",
  authRateLimitMiddleware,
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

authRoute.get(
  "/google/callback",
  authRateLimitMiddleware,
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  googleCallbackController,
);

authRoute.get("/me", validateUser, (req, res) => {
  res.status(200).json({ user: req.user });
});

export default authRoute;
