import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import { initSocket } from "./socket";
import apiRoutes from "./modules";
import { errorHandler } from "./middlewares/error.middleware";
import { db } from "./prisma/db";
import { connectRedis } from "./config/redis.config";

const app = express();
const server = http.createServer(app);

// const isAllowedOrigin = (
//   origin: string | undefined,
//   callback: (err: Error | null, allow?: boolean) => void,
// ) => {
//   if (
//     !origin ||
//     origin === process.env.CLIENT_URL ||
//     /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|172\.\d+\.\d+\.\d+)(:\d+)?$/.test(
//       origin,
//     )
//   ) {
//     callback(null, true);
//   } else {
//     callback(new Error("Not allowed by CORS"));
//   }
// };

app.use(
  cors({
    origin: [
      process.env.CLIENT_URL ?? "http://localhost:5001",
      process.env.MOBILE_URL ?? "http://localhost",
    ],
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

// Health check
app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok", engine: "Prisma 8", socket: "ready" });
});

// App API routes
app.use("/api", apiRoutes);

// Global Error Handler
app.use(errorHandler);

// Initialize Socket.io
initSocket(server);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await db.connect();
    console.log("🟢 PostgreSQL connected successfully.");

    await connectRedis();

    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
