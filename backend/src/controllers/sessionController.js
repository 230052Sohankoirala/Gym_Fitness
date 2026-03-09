import mongoose from "mongoose";
import Session from "../models/Session.js";
import User from "../models/User.js";
import Trainer from "../models/Trainer.js";
import { sendNotification } from "../utils/sendNotification.js";
import ChatAccess from "../models/ChatAccess.js";

/* ---------- populate utility ---------- */
const populateSession = (query) =>
  query
    .populate("trainer", "name fullname email role")
    .populate(
      "clientsEnrolled",
      "fullname name email role membership weight height age goals goal userGoals profile"
    );

/* ---------------- Create Session (trainer) ---------------- */
export const createSession = async (req, res) => {
  try {
    const { date, time, type, maxClients, priceInCents } = req.body;

    if (!date || !time || !type || maxClients === undefined || priceInCents === undefined) {
      return res.status(400).json({ message: "All fields are required (date, time, type, maxClients, priceInCents)" });
    }

    const maxC = Number(maxClients);
    if (!Number.isFinite(maxC) || maxC < 1 || maxC > 10) {
      return res.status(400).json({ message: "maxClients must be between 1 and 10" });
    }

    const cents = Number(priceInCents);
    if (!Number.isFinite(cents) || cents < 0) {
      return res.status(400).json({ message: "priceInCents must be 0 or more" });
    }

    // ✅ Trainer can only charge up to $10 (1000 cents)
    if (cents > 1000) {
      return res.status(400).json({ message: "Max price allowed is $10.00" });
    }

    const session = await Session.create({
      trainer: req.user._id,
      date: String(date),
      time: String(time),
      type: String(type),
      maxClients: maxC,
      priceInCents: Math.round(cents),
      status: "Pending",
      clientsEnrolled: [],
    });

    return res.status(201).json({ message: "Session created", session });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* ---------------- Admin: Get ALL Sessions ---------------- */
export const getAllSessions = async (_req, res) => {
  try {
    const sessions = await populateSession(Session.find().sort({ createdAt: -1 })).lean();
    return res.json(sessions);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* ---------------- Trainer: Get OWN Sessions ---------------- */
export const getTrainerSessions = async (req, res) => {
  try {
    const sessions = await populateSession(
      Session.find({ trainer: req.user._id }).sort({ createdAt: -1 })
    ).lean();
    return res.json(sessions);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* ---------------- Public/Member: Browse Sessions ---------------- */
export const getPublicSessions = async (req, res) => {
  try {
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.date) filter.date = req.query.date;

    const sessions = await populateSession(
      Session.find(filter).sort({ date: 1, time: 1 })
    ).lean();

    return res.json(sessions);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* ---------------- Member: Join a Session + notify ---------------- */
export const joinSession = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid session id" });
    }

    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    const meId = req.user._id.toString();

    const alreadyJoined = session.clientsEnrolled.some(
      (uid) => uid?.toString() === meId
    );

    // ✅ make it idempotent (no more annoying 400 spam)
    if (alreadyJoined) {
      return res.status(200).json({ message: "Already booked this session", session });
    }

    if (session.clientsEnrolled.length >= session.maxClients) {
      return res.status(400).json({ message: "Session is full" });
    }

    session.clientsEnrolled.push(req.user._id);

    if (session.clientsEnrolled.length === 1 && session.status === "Pending") {
      session.status = "Confirmed";
    }

    await session.save();

    // ✅ IMPORTANT: CREATE / EXTEND CHAT ACCESS (30 days)
    const trainerId =
      typeof session.trainer === "string" ? session.trainer : session.trainer?.toString();

    const newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + 30);

    await ChatAccess.findOneAndUpdate(
      { trainer: trainerId, member: req.user._id },
      { expiresAt: newExpiry },
      { upsert: true, new: true }
    );

    // 🔔 Notifications (best-effort)
    try {
      const member = await User.findById(req.user._id).select("fullname name email");
      const trainerDoc = await Trainer.findById(session.trainer).select("name user");

      const memberName = member?.fullname || member?.name || "Member";
      const trainerName = trainerDoc?.name || "your trainer";

      await sendNotification({
        user: member?._id,
        role: "member",
        type: "session",
        title: "Session Booking Confirmed",
        message: `You joined a ${session.type} session with ${trainerName}.`,
        data: { sessionId: session._id, trainerId: trainerDoc?._id },
      });

      await sendNotification({
        user: trainerDoc?.user,
        role: "trainer",
        type: "session",
        title: "New Session Booking",
        message: `${memberName} joined your ${session.type} session.`,
        data: { sessionId: session._id, memberId: member?._id },
      });
    } catch (notifyErr) {
      console.error("Session join notification error:", notifyErr);
    }

    return res.json({
      message: "Successfully joined session. Chat unlocked for 30 days.",
      session,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
/* ---------------- Start / Complete / Cancel (trainer) ---------------- */
export const startSession = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid session id" });

    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    const isOwner =
      session.trainer.toString() === req.user._id.toString() || req.user.role === "admin";
    if (!isOwner) return res.status(403).json({ message: "Not authorized to start this session" });

    session.status = "InProgress";
    session.startAt = new Date();
    await session.save();

    const populated = await populateSession(Session.findById(id)).lean();
    return res.json({ message: "Session started", session: populated });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const completeSession = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid session id" });

    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    const isOwner =
      session.trainer.toString() === req.user._id.toString() || req.user.role === "admin";
    if (!isOwner) return res.status(403).json({ message: "Not authorized to complete this session" });

    session.status = "Completed";
    session.endAt = new Date();
    await session.save();

    const populated = await populateSession(Session.findById(id)).lean();
    return res.json({ message: "Session completed", session: populated });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const cancelSession = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid session id" });

    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    const isOwner =
      session.trainer.toString() === req.user._id.toString() || req.user.role === "admin";
    if (!isOwner) return res.status(403).json({ message: "Not authorized to cancel this session" });

    session.status = "Cancelled";
    await session.save();

    const populated = await populateSession(Session.findById(id)).lean();
    return res.json({ message: "Session cancelled", session: populated });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* ---------------- Update Session (trainer/admin) ---------------- */
export const updateSession = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid session id" });

    const current = await Session.findById(id);
    if (!current) return res.status(404).json({ message: "Session not found" });

    const isOwner =
      current.trainer.toString() === req.user._id.toString() || req.user.role === "admin";
    if (!isOwner) return res.status(403).json({ message: "Not authorized to update this session" });

    // ✅ allow price update too, but cap at $10
    const allowed = ["date", "time", "type", "maxClients", "status", "priceInCents"];
    const updates = {};

    for (const k of allowed) {
      if (k in req.body) updates[k] = req.body[k];
    }

    if ("maxClients" in updates) {
      const maxC = Number(updates.maxClients);
      if (!Number.isFinite(maxC) || maxC < 1 || maxC > 10) {
        return res.status(400).json({ message: "maxClients must be between 1 and 10" });
      }
      updates.maxClients = maxC;
    }

    if ("priceInCents" in updates) {
      const cents = Number(updates.priceInCents);
      if (!Number.isFinite(cents) || cents < 0) {
        return res.status(400).json({ message: "priceInCents must be 0 or more" });
      }
      if (cents > 1000) {
        return res.status(400).json({ message: "Max price allowed is $10.00" });
      }
      updates.priceInCents = Math.round(cents);
    }

    const updated = await Session.findByIdAndUpdate(id, updates, { new: true });
    const populated = await populateSession(Session.findById(updated._id)).lean();

    return res.json({ message: "Session updated", session: populated });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* ---------------- Delete Session (trainer/admin) ---------------- */
export const deleteSession = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid session id" });

    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    const isOwner =
      session.trainer.toString() === req.user._id.toString() || req.user.role === "admin";
    if (!isOwner) return res.status(403).json({ message: "Not authorized to delete this session" });

    await session.deleteOne();
    return res.json({ message: "Session deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* ---------------- Trainer: Unique Booked Clients ---------------- */
export const getTrainerClients = async (req, res) => {
  try {
    const sessions = await Session.find({ trainer: req.user._id })
      .select("clientsEnrolled")
      .populate(
        "clientsEnrolled",
        "fullname name email role membership weight height age goals goal userGoals profile"
      )
      .lean();

    const seen = new Set();
    const uniqueClients = [];

    for (const s of sessions) {
      for (const u of s.clientsEnrolled || []) {
        const id = (u?._id || u?.id)?.toString();
        if (!id || seen.has(id)) continue;
        seen.add(id);
        uniqueClients.push(u);
      }
    }

    return res.json(uniqueClients);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
/* ---------------- Trainer: Clients + Sessions Joined ---------------- */
export const getTrainerClientsWithSessions = async (req, res) => {
  try {
    // fetch all trainer sessions with enrolled clients
    const sessions = await Session.find({ trainer: req.user._id })
      .select("_id date time type status priceInCents clientsEnrolled")
      .populate(
        "clientsEnrolled",
        "fullname name email role membership weight height age goals goal userGoals profile"
      )
      .sort({ date: 1, time: 1 })
      .lean();

    // Map clientId -> { user, sessions: [] }
    const map = new Map();

    for (const s of sessions) {
      const enrolled = Array.isArray(s.clientsEnrolled) ? s.clientsEnrolled : [];

      for (const u of enrolled) {
        const uid = (u?._id || u?.id)?.toString();
        if (!uid) continue;

        if (!map.has(uid)) {
          map.set(uid, { user: u, sessions: [] });
        }

        map.get(uid).sessions.push({
          _id: s._id,
          title: s.type || "Session",       // your schema uses "type" not "title"
          date: s.date,
          time: s.time,
          price: typeof s.priceInCents === "number" ? s.priceInCents / 100 : undefined,
          status: s.status || "Pending",
        });
      }
    }

    return res.json(Array.from(map.values()));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export default {
  createSession,
  getAllSessions,
  getTrainerSessions,
  getPublicSessions,
  joinSession,
  startSession,
  completeSession,
  cancelSession,
  updateSession,
  deleteSession,
  getTrainerClients,
  getTrainerClientsWithSessions,
};
