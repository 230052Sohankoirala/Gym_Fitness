// src/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";

// ✅ Only the routes shown in your screenshot
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import trainerRoutes from "./routes/trainerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

dotenv.config();

const app = express();
const isDev = process.env.NODE_ENV !== "production";

// ================= CORS =================
const allowedOrigins = ["http://localhost:3000", "http://localhost:5173"];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true); // Postman/curl
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ================= Security / Logging =================
app.use(
  helmet({
    crossOriginOpenerPolicy: isDev ? false : { policy: "same-origin" },
  })
);
app.use(morgan("dev"));
app.use(cookieParser());

// ================= Body Parsers =================
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// ================= DB =================
connectDB().catch((err) => console.error("MongoDB connection error:", err));

// ================= Routes =================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/trainers", trainerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/sessions", sessionRoutes);
// ================= Health =================
app.get("/", (_req, res) => res.send("🚀 API is running..."));
app.use("/api/tasks", taskRoutes);
// ================= Error Middleware =================
app.use((err, _req, res, _next) => {
  console.error("Error:", err.stack || err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Server Error",
  });
});

// ================= Start =================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
