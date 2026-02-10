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
    if ((req.role || req.user?.role) !== "trainer") {
      return res.status(403).json({ message: "Trainer only" });
    }

    const trainerId = req.user._id;

    // active chat access list
    const activeAccess = await ChatAccess.find({
      trainer: trainerId,
      expiresAt: { $gt: new Date() },
    })
      // ✅ include avatar fields + updatedAt (cache-busting)
      .populate("member", "fullname username name email avatar avatarUrl profileImage photoUrl image updatedAt")
      .lean();

    const threads = await Promise.all(
      activeAccess.map(async (a) => {
        const last = await Message.findOne({
          trainer: trainerId,
          member: a.member._id,
        })
          .sort({ createdAt: -1 })
          .select("text createdAt")
          .lean();

        const rawAvatar = pickAvatar(a.member);
        const avatarUrl = buildPublicUrl(req, rawAvatar);

        return {
          memberId: a.member._id,
          name: a.member.fullname || a.member.name || a.member.username || "Member",
          email: a.member.email || "",
          avatarUrl, // ✅ used by frontend
          avatarUpdatedAt: a.member.updatedAt || null, // ✅ used to bust cache
          lastText: last?.text || "",
          lastAt: last?.createdAt || null,
          chatExpiresAt: a.expiresAt,
        };
      })
    );

    // newest active threads first
    threads.sort((a, b) => {
      const ta = a.lastAt ? new Date(a.lastAt).getTime() : 0;
      const tb = b.lastAt ? new Date(b.lastAt).getTime() : 0;
      return tb - ta;
    });

    return res.json(threads);
  } catch (err) {
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

export default {
  getTrainerThreads,
  sendMessage,
  getMessages,
};
