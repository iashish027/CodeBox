import express from "express";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./shared/middlewares/errorMiddleware.js";
import authRoutes from "./modules/auth/auth.routes.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

//code for routes goes here
app.get("/api/health", (req, res) => {
  return res.status(200).json({ message: "Codebox server is running" });
});

app.use("/api/auth", authRoutes);

app.use(errorMiddleware);

export { app };
