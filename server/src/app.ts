import cors from "cors";
import express from "express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { assetsRouter } from "./routes/assets.js";
import { phmsaRouter } from "./routes/phmsa.js";

export const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmet());
app.use(limiter);
app.use(cors());
app.use(express.json());
app.use("/assets", assetsRouter);
app.use("/phmsa", phmsaRouter);
