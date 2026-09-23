import express from 'express';
const authRoute = express.Router()

import { registerController,loginController } from './auth.controller.js';

import { validateUser } from "../../middleware/auth.middleware.js";

authRoute.post("/register",registerController)
authRoute.post("/login",loginController)

authRoute.get("/me", validateUser, (req, res) => {
  res.status(200).json({ user: req.user });
});

export default authRoute