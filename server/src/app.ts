import cors from "cors";
import express from "express";
import { assetsRouter } from "./routes/assets.js";

export const app = express();

app.use(cors());
app.use(express.json());
app.use("/assets", assetsRouter);
