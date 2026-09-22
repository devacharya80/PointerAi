import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json())