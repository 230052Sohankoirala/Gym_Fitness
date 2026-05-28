import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

import connectDB from "./config/db.js";
import { handleStripeWebhook } from "./controllers/paymentController.js";

import notificationPreferencesRoutes from "./routes/notificationPreferences.js";
import paymentsRouter from "./routes/payments.js";
import taskRoutes from "./routes/taskRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import adminPaymentRoutes from "./routes/adminPaymentRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import nutritionRoutes from "./routes/nutritionRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import workoutRoutes from "./routes/workoutRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import trainerRoutes from "./routes/trainerRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import adminRevenueRoutes from "./routes/adminRevenueRoutes.js";
import subscriptionRoutes from "./routes/subscriptions.js";
import notificationsRouter from "./routes/notifications.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import workoutPlanRoutes from "./routes/workoutPlanRoutes.js";
import trainerStripeRoutes from "./routes/trainerStripeRoutes.js";
import adminMessageRoutes from "./routes/adminMessageRoutes.js";
import trainerAdminChatRoutes from "./routes/trainerAdminChatRoutes.js";
import trainerApplicationRoutes from "./routes/trainerApplicationRoutes.js";

import User from "./models/User.js";
import Trainer from "./models/Trainer.js";
import Admin from "./models/Admin.js";
import Message from "./models/Message.js";
import ChatAccess from "./models/ChatAccess.js";
import AdminTrainerChat from "./models/AdminTrainerChat.js";
import AdminTrainerMessage from "./models/AdminTrainerMessage.js";

dotenv.config();

const app = express();
const isDev = process.env.NODE_ENV !== "production";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ---------------- Upload folders ---------------- */
const uploadsRoot = path.join(process.cwd(), "uploads");
const avatarsDir = path.join(uploadsRoot, "avatars");
const trainerAvatarsDir = path.join(uploadsRoot, "trainer-avatars");
const chatDir = path.join(uploadsRoot, "chat");
const trainerCertificatesDir = path.join(uploadsRoot, "trainer-certificates");

fs.mkdirSync(uploadsRoot, { recursive: true });
fs.mkdirSync(avatarsDir, { recursive: true });
fs.mkdirSync(trainerAvatarsDir, { recursive: true });
fs.mkdirSync(chatDir, { recursive: true });
fs.mkdirSync(trainerCertificatesDir, { recursive: true });

/* ---------------- CORS ---------------- */
/* ---------------- CORS ---------------- */
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://gym-fitness-sage.vercel.app",
  "https://gym-fitness-l9asranxt-230052sohankoiralas-projects.vercel.app",
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
].filter(Boolean);

const isOriginAllowed = (origin) => {
  if (!origin) {
    return true;
  }

  const isAllowedExact = allowedOrigins.includes(origin);

  const isAllowedVercel =
    origin.endsWith(".vercel.app") && origin.includes("gym-fitness");

  return isAllowedExact || isAllowedVercel;
};

const corsOptions = {
  origin(origin, callback) {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }

    console.log("❌ Blocked by CORS origin:", origin);

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.options("/{*splat}", cors(corsOptions));

app.use(
  helmet({
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
  })
);
app.use(morgan("dev"));
app.use(cookieParser());

/* ---------------- Stripe webhook before JSON parser ---------------- */
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

connectDB().catch((err) => {
  console.error("MongoDB connection error:", err);
});

/* ---------------- API Routes ---------------- */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/nutrition", nutritionRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/workout-plans", workoutPlanRoutes);
app.use("/api/admin", adminPaymentRoutes);
app.use("/api/trainers", trainerRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationsRouter);
app.use("/api/notification-preferences", notificationPreferencesRoutes);
app.use("/api/admin", adminRevenueRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/trainers/stripe", trainerStripeRoutes);
app.use("/api/payments", paymentsRouter);
app.use("/api/trainer-applications", trainerApplicationRoutes);
app.use("/api/admin-messages", adminMessageRoutes);
app.use("/api/trainer", trainerAdminChatRoutes);

/* ---------------- Static Files ---------------- */
const staticHeaders = (res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
};

app.use(
  "/uploads",
  express.static(uploadsRoot, {
    setHeaders: staticHeaders,
  })
);

app.use(
  "/uploads/avatars",
  express.static(avatarsDir, {
    setHeaders: staticHeaders,
  })
);

app.use(
  "/uploads/chat",
  express.static(chatDir, {
    setHeaders: staticHeaders,
  })
);

app.use(
  "/uploads/trainer-certificates",
  express.static(trainerCertificatesDir, {
    setHeaders: staticHeaders,
  })
);

app.use(
  "/trainer-avatars",
  express.static(trainerAvatarsDir, {
    setHeaders: staticHeaders,
  })
);

app.get("/", (_req, res) => {
  res.send("🚀 API is running...");
});

/* ---------------- Socket.IO Server ---------------- */
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin(origin, callback) {
      if (isOriginAllowed(origin)) {
        return callback(null, true);
      }

      console.log("❌ Socket blocked by CORS origin:", origin);

      return callback(new Error("Not allowed by Socket.IO CORS"));
    },
    credentials: true,
  },
  transports: ["websocket", "polling"],
  allowEIO3: true,
  pingTimeout: 25000,
  pingInterval: 20000,
});

/**
 * Important:
 * This allows controllers, such as messageController.js,
 * to access Socket.IO using req.app.get("io").
 */
app.set("io", io);

io.engine.on("connection_error", (err) => {
  console.log("🧨 ENGINE connection_error:", {
    code: err.code,
    message: err.message,
    context: err.context,
  });
});

/* ---------------- Chat Access Helper ---------------- */
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

/* ---------------- Socket Authentication ---------------- */
io.use(async (socket, next) => {
  try {
    const rawAuthHeader = socket.handshake.headers?.authorization || "";

    const headerToken = rawAuthHeader.startsWith("Bearer ")
      ? rawAuthHeader.replace("Bearer ", "")
      : "";

    const token = socket.handshake.auth?.token || headerToken;

    if (!token) {
      return next(new Error("No token"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.id) {
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
      return next(new Error("Account not found"));
    }

    socket.user = {
      id: String(account._id),
      role: decoded.role || account.role,
      name: account.fullname || account.fullName || account.name || "User",
    };

    return next();
  } catch (error) {
    return next(new Error("Socket auth failed"));
  }
});

/* ---------------- Socket Events ---------------- */
io.on("connection", (socket) => {
  console.log("✅ SOCKET connected:", socket.id, socket.user?.role);

  /* ---------------- Member/Trainer Chat Join ---------------- */
  socket.on("chat:join", async ({ trainerId, memberId }) => {
    try {
      const me = socket.user;

      if (!trainerId) {
        throw new Error("trainerId required");
      }

      if (me.role === "member") {
        await verifyChatAccess30Days(trainerId, me.id);

        const room = `chat:${trainerId}:${me.id}`;

        socket.join(room);

        socket.emit("chat:joined", {
          room,
        });

        return;
      }

      if (me.role === "trainer") {
        if (String(me.id) !== String(trainerId)) {
          throw new Error("TrainerId mismatch");
        }

        if (!memberId) {
          throw new Error("memberId required");
        }

        await verifyChatAccess30Days(trainerId, memberId);

        const room = `chat:${trainerId}:${memberId}`;

        socket.join(room);

        socket.emit("chat:joined", {
          room,
        });

        return;
      }

      throw new Error("Not allowed");
    } catch (error) {
      socket.emit("chat:error", {
        message: error.message || "Join failed",
      });
    }
  });

  /* ---------------- Member/Trainer Text Message ---------------- */
  socket.on("chat:send", async ({ trainerId, memberId, text }) => {
    try {
      const me = socket.user;
      const clean = String(text || "").trim();

      if (!clean) {
        throw new Error("Message cannot be empty");
      }

      if (!trainerId) {
        throw new Error("trainerId required");
      }

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

        if (!memberId) {
          throw new Error("memberId required");
        }

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
        sender: {
          _id: me.id,
          role: me.role,
          name: me.name,
        },
        createdAt: msg.createdAt,
      };

      const room = `chat:${trainerId}:${memberFinal}`;

      io.to(room).emit("chat:new", payload);
    } catch (error) {
      socket.emit("chat:error", {
        message: error.message || "Send failed",
      });
    }
  });

  /* ---------------- Admin-Trainer Chat Join ---------------- */
  socket.on("adminTrainer:join", async ({ chatId }) => {
    try {
      const me = socket.user;

      if (!chatId) {
        throw new Error("chatId required");
      }

      const chat = await AdminTrainerChat.findById(chatId).lean();

      if (!chat) {
        throw new Error("Chat not found");
      }

      const isAdmin =
        me.role === "admin" && String(chat.adminId) === String(me.id);

      const isTrainer =
        me.role === "trainer" && String(chat.trainerId) === String(me.id);

      if (!isAdmin && !isTrainer) {
        throw new Error("Forbidden");
      }

      const room = `adminTrainer:${chatId}`;

      socket.join(room);

      socket.emit("adminTrainer:joined", {
        room,
      });
    } catch (error) {
      socket.emit("adminTrainer:error", {
        message: error.message || "Join failed",
      });
    }
  });

  /* ---------------- Admin-Trainer Text Message ---------------- */
  socket.on("adminTrainer:send", async ({ chatId, text }) => {
    try {
      const me = socket.user;
      const clean = String(text || "").trim();

      if (!chatId) {
        throw new Error("chatId required");
      }

      if (!clean) {
        throw new Error("Message cannot be empty");
      }

      const chat = await AdminTrainerChat.findById(chatId).lean();

      if (!chat) {
        throw new Error("Chat not found");
      }

      const isAdmin =
        me.role === "admin" && String(chat.adminId) === String(me.id);

      const isTrainer =
        me.role === "trainer" && String(chat.trainerId) === String(me.id);

      if (!isAdmin && !isTrainer) {
        throw new Error("Forbidden");
      }

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
    } catch (error) {
      socket.emit("adminTrainer:error", {
        message: error.message || "Send failed",
      });
    }
  });

  /* ---------------- Disconnect ---------------- */
  socket.on("disconnect", (reason) => {
    console.log("🔴 SOCKET disconnected:", socket.id, reason);
  });
});

/* ---------------- Error Handler ---------------- */
app.use((err, _req, res, _next) => {
  console.error("Error:", err.stack || err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Server Error",
  });
});

/* ---------------- Start Server ---------------- */
const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server + Socket.IO running on port ${PORT}`);
});