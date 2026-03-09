// src/controllers/messageController.js
import mongoose from "mongoose";
import Message from "../models/Message.js";
import ChatAccess from "../models/ChatAccess.js";
import Session from "../models/Session.js";

/**
 * Build a public URL for images stored as:
 *  - absolute URL: https://...
 *  - relative path: /uploads/avatars/abc.jpg
 *  - other relative: /something
 */
const buildPublicUrl = (req, pathOrUrl) => {
  if (!pathOrUrl) return "";
  const str = String(pathOrUrl).trim();

  // already absolute
  if (str.startsWith("http://") || str.startsWith("https://")) return str;

  // relative (starts with /)
  if (str.startsWith("/")) {
    return `${req.protocol}://${req.get("host")}${str}`;
  }

  // fallback
  return str;
};

const pickAvatar = (doc) => {
  return (
    doc?.avatarUrl ||
    doc?.profileImage ||
    doc?.photoUrl ||
    doc?.image ||
    doc?.avatar ||
    ""
  );
};

/**
 * ✅ Chat allowed ONLY if (trainer, member) has ChatAccess.expiresAt in the future
 */
async function verifyChatAccess(trainerId, memberId) {
  const access = await ChatAccess.findOne({
    trainer: trainerId,
    member: memberId,
    expiresAt: { $gt: new Date() },
  }).lean();

  if (access) return true;
  throw new Error("Chat locked. Book again to unlock chat for 30 days.");
}

/**
 * ✅ GET trainer threads (trainer-only)
 * GET /api/messages/threads
 *
 * Returns:
 * [
 *   {
 *     memberId,
 *     name,
 *     email,
 *     avatarUrl,
 *     avatarUpdatedAt,
 *     lastText,
 *     lastAt,
 *     chatExpiresAt
 *   }
 * ]
 */
export const getTrainerThreads = async (req, res) => {
  try {
    const role = req.role || req.user?.role;

    if (role !== "trainer") {
      return res.status(403).json({ message: "Trainer only" });
    }

    const trainerId = req.user?._id;
    if (!trainerId) {
      return res.status(401).json({ message: "Unauthorized: trainer not found" });
    }

    const activeAccess = await ChatAccess.find({
      trainer: trainerId,
      expiresAt: { $gt: new Date() },
    })
      .populate("member", "fullname username name email avatar avatarUrl profileImage photoUrl image updatedAt")
      .lean();

    // ✅ FILTER OUT BROKEN / NULL MEMBERS (prevents _id crash)
    const safeAccess = (activeAccess || []).filter((a) => a?.member && a?.member?._id);

    const threads = await Promise.all(
      safeAccess.map(async (a) => {
        const memberId = a.member._id;

        const last = await Message.findOne({
          trainer: trainerId,
          member: memberId,
        })
          .sort({ createdAt: -1 })
          .select("text createdAt")
          .lean();

        const rawAvatar = pickAvatar(a.member);
        const avatarUrl = buildPublicUrl(req, rawAvatar);

        return {
          memberId,
          name: a.member.fullname || a.member.name || a.member.username || "Member",
          email: a.member.email || "",
          avatarUrl,
          avatarUpdatedAt: a.member.updatedAt || null,
          lastText: last?.text || "",
          lastAt: last?.createdAt || null,
          chatExpiresAt: a.expiresAt,
        };
      })
    );

    threads.sort((a, b) => {
      const ta = a.lastAt ? new Date(a.lastAt).getTime() : 0;
      const tb = b.lastAt ? new Date(b.lastAt).getTime() : 0;
      return tb - ta;
    });

    return res.json(threads);
  } catch (err) {
    console.error("getTrainerThreads error:", err);
    return res.status(400).json({ message: err.message || "Failed to load threads" });
  }
};


/**
 * ✅ Send message (BOTH)
 * POST /api/messages/:trainerId
 * - member: body { text }
 * - trainer: body { text, memberId }
 */
export const sendMessage = async (req, res) => {
  try {
    const { trainerId } = req.params;
    const { text, memberId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(trainerId)) {
      return res.status(400).json({ message: "Invalid trainerId" });
    }

    const clean = String(text || "").trim();
    if (!clean) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    const role = req.role || req.user?.role;

    // ✅ MEMBER sending
    if (role === "member") {
      const member = req.user._id;
      await verifyChatAccess(trainerId, member);

      const msg = await Message.create({
        trainer: trainerId,
        member,
        senderModel: "User",
        sender: member,
        text: clean,
      });

      const populated = await Message.findById(msg._id)
        .populate("sender", "fullname username name role avatar avatarUrl profileImage photoUrl image updatedAt")
        .lean();

      const raw = pickAvatar(populated?.sender);
      const senderAvatarUrl = buildPublicUrl(req, raw);

      return res.status(201).json({
        ...populated,
        senderAvatarUrl,
        senderAvatarUpdatedAt: populated?.sender?.updatedAt || null,
      });
    }

    // ✅ TRAINER sending
    if (role === "trainer") {
      if (String(req.user._id) !== String(trainerId)) {
        return res.status(403).json({ message: "TrainerId mismatch" });
      }

      if (!memberId || !mongoose.Types.ObjectId.isValid(memberId)) {
        return res.status(400).json({ message: "memberId is required for trainers" });
      }

      await verifyChatAccess(trainerId, memberId);

      const msg = await Message.create({
        trainer: trainerId,
        member: memberId,
        senderModel: "Trainer",
        sender: req.user._id,
        text: clean,
      });

      const populated = await Message.findById(msg._id)
        .populate("sender", "fullname username name role avatar avatarUrl profileImage photoUrl image updatedAt")
        .lean();

      const raw = pickAvatar(populated?.sender);
      const senderAvatarUrl = buildPublicUrl(req, raw);

      return res.status(201).json({
        ...populated,
        senderAvatarUrl,
        senderAvatarUpdatedAt: populated?.sender?.updatedAt || null,
      });
    }

    return res.status(403).json({ message: "Only member/trainer can chat" });
  } catch (err) {
    return res.status(400).json({ message: err.message || "Failed to send message" });
  }
};

/**
 * ✅ Get messages (BOTH)
 * GET /api/messages/:trainerId
 * - member: no query needed
 * - trainer: ?memberId=xxx
 *
 * Returns messages enriched with:
 *  - senderAvatarUrl
 *  - senderAvatarUpdatedAt
 */
export const getMessages = async (req, res) => {
  try {
    const { trainerId } = req.params;
    const { memberId } = req.query;
    const user = req.user;

    if (!mongoose.Types.ObjectId.isValid(trainerId)) {
      return res.status(400).json({ message: "Invalid trainerId" });
    }

    let member;
    let trainer;

    // MEMBER
    if (user.role === "member") {
      member = user._id;
      trainer = trainerId;
    }
    // TRAINER
    else if (user.role === "trainer") {
      if (!memberId || !mongoose.Types.ObjectId.isValid(memberId)) {
        return res.status(400).json({ message: "memberId query param required" });
      }
      trainer = user._id;
      member = memberId;
    } else {
      return res.status(403).json({ message: "Invalid role for chat" });
    }

    // ✅ session check (your rule)
    const hasSession = await Session.exists({
      trainer,
      clientsEnrolled: member,
    });

    if (!hasSession) {
      return res.status(403).json({ message: "No active session between member and trainer" });
    }

    // ✅ fetch messages + sender info
    const messages = await Message.find({ trainer, member })
      .sort({ createdAt: 1 })
      .populate("sender", "role fullname username name avatar avatarUrl profileImage photoUrl image updatedAt")
      .lean();

    // ✅ enrich with sender avatar URL so frontend can show bubble image easily
    const enriched = messages.map((m) => {
      const raw = pickAvatar(m?.sender);
      return {
        ...m,
        senderAvatarUrl: buildPublicUrl(req, raw),
        senderAvatarUpdatedAt: m?.sender?.updatedAt || null,
      };
    });

    return res.json(enriched);
  } catch (err) {
    console.error("getMessages error:", err);
    return res.status(500).json({ message: "Failed to load messages" });
  }
};
// ✅ POST /api/messages/:trainerId/media
// - member: body { text optional } + files[]
// - trainer: body { text optional, memberId } + files[]
export const sendMediaMessage = async (req, res) => {
  try {
    const { trainerId } = req.params;
    const user = req.user;

    const role = req.role || user?.role;
    const { memberId } = req.body;

    // ✅ files from multer
    const files = req.files || [];
    if (!files.length) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    // ✅ decide member + senderModel exactly like sendMessage()
    let memberFinal = null;
    let senderModel = null;

    if (role === "member") {
      memberFinal = user._id;
      senderModel = "User";
      await verifyChatAccess(trainerId, memberFinal);
    } else if (role === "trainer") {
      if (String(user._id) !== String(trainerId)) {
        return res.status(403).json({ message: "TrainerId mismatch" });
      }
      if (!memberId) return res.status(400).json({ message: "memberId is required" });
      memberFinal = memberId;
      senderModel = "Trainer";
      await verifyChatAccess(trainerId, memberFinal);
    } else {
      return res.status(403).json({ message: "Only member/trainer can upload" });
    }

    const attachments = files.map((f) => {
      const url = `${req.protocol}://${req.get("host")}/uploads/chat/${f.filename}`;
      const mime = f.mimetype || "";
      const type = mime.startsWith("image/")
        ? "image"
        : mime.startsWith("video/")
        ? "video"
        : "file";

      return {
        type,
        url,
        filename: f.originalname,
        mime,
        size: f.size,
      };
    });

    // ✅ save as a Message row (text optional)
    const msg = await Message.create({
      trainer: trainerId,
      member: memberFinal,
      senderModel,
      sender: user._id,
      text: req.body.text ? String(req.body.text).trim() : "",
      attachments, // ✅ new field (see schema update below)
    });

    const populated = await Message.findById(msg._id)
      .populate("sender", "fullname username name role avatar avatarUrl profileImage photoUrl image updatedAt")
      .lean();

    return res.status(201).json(populated);
  } catch (err) {
    console.error("sendMediaMessage error:", err);
    return res.status(500).json({ message: err.message || "Upload failed" });
  }
};
export default {
  getTrainerThreads,
  sendMessage,
  getMessages,
  sendMediaMessage,
};
