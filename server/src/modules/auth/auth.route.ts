import express from "express";
import passport from "passport";

import {
  registerController,
  loginController,
  refreshController,
  logoutController,
  googleCallbackController,
  exchangeCodeController,
} from "./auth.controller.js";

import { authRateLimitMiddleware } from "../../middleware/rateLimit.middleware.js";

const authRoute = express.Router();

authRoute.post("/register", authRateLimitMiddleware, registerController);
authRoute.post("/login", authRateLimitMiddleware, loginController);
authRoute.post("/refresh", authRateLimitMiddleware, refreshController);
authRoute.post("/logout", authRateLimitMiddleware, logoutController);
authRoute.post("/exchange", authRateLimitMiddleware, exchangeCodeController);

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

export default authRoute;