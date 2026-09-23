import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";

import type { Request, Response } from "express";

import {errorHandler} from "./middleware/errorHandler.js"

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json())

app.get("/health",(req:Request,res: Response) => {
    res.status(200).json({
        "status" : "ok",
        "timestamp": new Date().toISOString()
    })
})

app.use(errorHandler)