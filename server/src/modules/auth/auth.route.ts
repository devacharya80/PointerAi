import express from 'express';
const authRoute = express.Router()

import { registerController,loginController } from './auth.controller.js';

authRoute.post("/register",registerController)
authRoute.post("/login",loginController)

export default authRoute