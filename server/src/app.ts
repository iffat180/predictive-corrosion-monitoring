import express from "express";
import { assetsRouter } from "./routes/assets.js";

export const app = express();

app.use(express.json());
app.use("/assets", assetsRouter);
