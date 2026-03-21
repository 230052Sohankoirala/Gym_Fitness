// src/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

import connectDB from "./config/db.js";

// ✅ Stripe webhook controller
import { handleStripeWebhook } from "./controllers/paymentController.js";

// Routes
import notificationPreferencesRoutes from "./routes/notificationPreferences.js";
import paymentsRouter from "./routes/payments.js";
import taskRoutes from "./routes/taskRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import nutritionRoutes from "./routes/nutritionRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import workoutRoutes from "./routes/workoutRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import trainerRoutes from "./routes/trainerRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import subscriptionRoutes from "./routes/subscriptions.js";
import notificationsRouter from "./routes/notifications.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import trainerStripeRoutes from "./routes/trainerStripeRoutes.js";
import adminMessageRoutes from "./routes/adminMessageRoutes.js";
import trainerAdminChatRoutes from "./routes/trainerAdminChatRoutes.js";

// Models
import User from "./models/User.js";
import Trainer from "./models/Trainer.js";
import Admin from "./models/Admin.js";
import Message from "./models/Message.js";
import ChatAccess from "./models/ChatAccess.js";

// Admin↔Trainer chat models
import AdminTrainerChat from "./models/AdminTrainerChat.js";
import AdminTrainerMessage from "./models/AdminTrainerMessage.js";

dotenv.config();

const app = express();
const isDev = process.env.NODE_ENV !== "production";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ================= CORS =================
const allowedOrigins = ["http://localhost:3000", "http://localhost:5173"];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      console.log("❌ Blocked by CORS origin:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(
  helmet({
    crossOriginOpenerPolicy: isDev ? false : { policy: "same-origin" },
    crossOriginResourcePolicy: isDev ? false : { policy: "same-origin" },
  })
);

app.use(morgan("dev"));
app.use(cookieParser());

/**
 * ✅ IMPORTANT:
 * Stripe webhook must use RAW body and must be mounted
 * BEFORE express.json()
 */
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

// ✅ Normal JSON parsers for all other routes
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

connectDB().catch((err) => console.error("MongoDB connection error:", err));

// ================= API Routes =================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/nutrition", nutritionRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/trainers", trainerRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationsRouter);
app.use("/api/notification-preferences", notificationPreferencesRoutes);

app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/trainers/stripe", trainerStripeRoutes);
app.use("/api/payments", paymentsRouter);

// ✅ Admin ↔ Trainer messaging routes
app.use("/api/admin-messages", adminMessageRoutes);
app.use("/api/trainer", trainerAdminChatRoutes);

// ================= STATIC FILES =================
app.use(
  "/uploads/avatars",
  express.static(path.join(__dirname, "../uploads/avatars"), {
    setHeaders: (res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

app.use(
  "/uploads/chat",
  express.static(path.join(__dirname, "../uploads/chat"), {
    setHeaders: (res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

app.get("/", (_req, res) => res.send("🚀 API is running..."));

// ================= SOCKET.IO =================
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
  transports: ["websocket", "polling"],
  allowEIO3: true,
  pingTimeout: 25000,
  pingInterval: 20000,
});

io.engine.on("connection_error", (err) => {
  console.log("🧨 ENGINE connection_error:", {
    code: err.code,
    message: err.message,
    context: err.context,
  });
});

/**
 * ✅ 30-day rule check (member ↔ trainer)
 */
async function verifyChatAccess30Days(trainerId, memberId) {
  const access = await ChatAccess.findOne({
    trainer: trainerId,
    member: memberId,
    expiresAt: { $gt: new Date() },
  }).lean();

  if (!access) {
    throw new Error("Chat locked. Book again to unlock chat for 30 days.");
  }

  return true;
}

/**
 * ✅ SOCKET AUTH (member / trainer / admin)
 */
io.use(async (socket, next) => {
  try {
    const rawAuthHeader = socket.handshake.headers?.authorization || "";
    const headerToken = rawAuthHeader.startsWith("Bearer ")
      ? rawAuthHeader.replace("Bearer ", "")
      : "";

    const token = socket.handshake.auth?.token || headerToken;

    if (!token) {
      console.log("❌ SOCKET AUTH: No token");
      return next(new Error("No token"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.id) {
      console.log("❌ SOCKET AUTH: Invalid decoded token");
      return next(new Error("Invalid token"));
    }

    let account = null;

    if (decoded.role === "trainer") {
      account = await Trainer.findById(decoded.id).select(
        "_id role name fullName fullname email"
      );
    } else if (decoded.role === "admin") {
      account = await Admin.findById(decoded.id).select(
        "_id role name fullName fullname email"
      );

      if (!account) {
        account = await User.findById(decoded.id).select(
          "_id role name fullName fullname email"
        );
      }
    } else {
      account = await User.findById(decoded.id).select(
        "_id role fullname name fullName email"
      );
    }

    if (!account) {
      console.log("❌ SOCKET AUTH: Account not found for id:", decoded.id);
      return next(new Error("Account not found"));
    }

    socket.user = {
      id: String(account._id),
      role: decoded.role || account.role,
      name: account.fullname || account.fullName || account.name || "User",
    };

    console.log("✅ SOCKET AUTH OK:", socket.user);
    return next();
  } catch (e) {
    console.log("❌ SOCKET AUTH FAIL:", e?.message);
    return next(new Error("Socket auth failed"));
  }
});

io.on("connection", (socket) => {
  console.log("✅ SOCKET connected:", socket.id, socket.user?.role);

  // =========================
  // 1) MEMBER ↔ TRAINER CHAT
  // =========================
  socket.on("chat:join", async ({ trainerId, memberId }) => {
    try {
      const me = socket.user;

      if (!trainerId) throw new Error("trainerId required");

      if (me.role === "member") {
        await verifyChatAccess30Days(trainerId, me.id);
        const room = `chat:${trainerId}:${me.id}`;
        socket.join(room);
        socket.emit("chat:joined", { room });
        return;
      }

      if (me.role === "trainer") {
        if (String(me.id) !== String(trainerId)) {
          throw new Error("TrainerId mismatch");
        }

        if (!memberId) throw new Error("memberId required");

        await verifyChatAccess30Days(trainerId, memberId);
        const room = `chat:${trainerId}:${memberId}`;
        socket.join(room);
        socket.emit("chat:joined", { room });
        return;
      }

      throw new Error("Not allowed");
    } catch (err) {
      socket.emit("chat:error", { message: err.message || "Join failed" });
    }
  });

  socket.on("chat:send", async ({ trainerId, memberId, text }) => {
    try {
      const me = socket.user;
      const clean = String(text || "").trim();

      if (!clean) throw new Error("Message cannot be empty");
      if (!trainerId) throw new Error("trainerId required");

      let memberFinal = null;
      let senderModel = null;

      if (me.role === "member") {
        memberFinal = me.id;
        senderModel = "User";
        await verifyChatAccess30Days(trainerId, memberFinal);
      } else if (me.role === "trainer") {
        if (String(me.id) !== String(trainerId)) {
          throw new Error("TrainerId mismatch");
        }

        if (!memberId) throw new Error("memberId required");

        memberFinal = memberId;
        senderModel = "Trainer";
        await verifyChatAccess30Days(trainerId, memberFinal);
      } else {
        throw new Error("Not allowed");
      }

      const msg = await Message.create({
        trainer: trainerId,
        member: memberFinal,
        senderModel,
        sender: me.id,
        text: clean,
      });

      const payload = {
        _id: String(msg._id),
        trainer: trainerId,
        member: memberFinal,
        text: clean,
        senderModel,
        sender: { _id: me.id, role: me.role, name: me.name },
        createdAt: msg.createdAt,
      };

      const room = `chat:${trainerId}:${memberFinal}`;
      io.to(room).emit("chat:new", payload);
    } catch (err) {
      socket.emit("chat:error", { message: err.message || "Send failed" });
    }
  });

  // =========================
  // 2) ADMIN ↔ TRAINER CHAT
  // =========================
  socket.on("adminTrainer:join", async ({ chatId }) => {
    try {
      const me = socket.user;

      if (!chatId) throw new Error("chatId required");

      const chat = await AdminTrainerChat.findById(chatId).lean();
      if (!chat) throw new Error("Chat not found");

      const isAdmin =
        me.role === "admin" && String(chat.adminId) === String(me.id);
      const isTrainer =
        me.role === "trainer" && String(chat.trainerId) === String(me.id);

      if (!isAdmin && !isTrainer) throw new Error("Forbidden");

      const room = `adminTrainer:${chatId}`;
      socket.join(room);
      socket.emit("adminTrainer:joined", { room });
    } catch (e) {
      socket.emit("adminTrainer:error", { message: e.message || "Join failed" });
    }
  });

  socket.on("adminTrainer:send", async ({ chatId, text }) => {
    try {
      const me = socket.user;
      const clean = String(text || "").trim();

      if (!chatId) throw new Error("chatId required");
      if (!clean) throw new Error("Message cannot be empty");

      const chat = await AdminTrainerChat.findById(chatId).lean();
      if (!chat) throw new Error("Chat not found");

      const isAdmin =
        me.role === "admin" && String(chat.adminId) === String(me.id);
      const isTrainer =
        me.role === "trainer" && String(chat.trainerId) === String(me.id);

      if (!isAdmin && !isTrainer) throw new Error("Forbidden");

      const senderRole = isAdmin ? "admin" : "trainer";

      const saved = await AdminTrainerMessage.create({
        chatId,
        adminId: chat.adminId,
        trainerId: chat.trainerId,
        senderRole,
        senderId: me.id,
        text: clean,
      });

      const payload = {
        _id: String(saved._id),
        chatId: String(chatId),
        adminId: String(chat.adminId),
        trainerId: String(chat.trainerId),
        senderRole,
        senderId: String(me.id),
        text: clean,
        createdAt: saved.createdAt,
      };

      io.to(`adminTrainer:${chatId}`).emit("adminTrainer:new", payload);
    } catch (e) {
      socket.emit("adminTrainer:error", { message: e.message || "Send failed" });
    }
  });

  socket.on("disconnect", (reason) => {
    console.log("🔴 SOCKET disconnected:", socket.id, reason);
  });
});

// ================= ERROR HANDLER =================
app.use((err, _req, res, _next) => {
  console.error("Error:", err.stack || err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Server Error",
  });
});

// ============= Start Server =============
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server + Socket.IO running on port ${PORT}`);
});