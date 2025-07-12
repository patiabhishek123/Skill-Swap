import express from "express";
import cors from "cors";
import { createServer } from "http";
import { config } from "dotenv";
import userRouter from "./routes/user.route.js";
import { connectDB } from "./db/db.js";
config();

const PORT = process.env.PORT || 3000;

async function init() {
  const app = express();
  const server = createServer(app);
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  connectDB();

  app.use("/api/auth", userRouter);

  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

init();
