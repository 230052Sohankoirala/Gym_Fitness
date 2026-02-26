// src/routes/adminMessageRoutes.js
import express from "express";
import mongoose from "mongoose";

import User from "../models/User.js";
import Trainer from "../models/Trainer.js";

import AdminTrainerChat from "../models/AdminTrainerChat.js";
import AdminTrainerMessage from "../models/AdminTrainerMessage.js";

import { protect } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";

const router = express.Router();

/**
 * GET /api/admin-messages/trainers
 * ✅ Returns trainers to message
 * IMPORTANT:
 * - Your project uses Trainer model for trainer login/socket auth.
 * - So fetch Trainer collection first.
 * - Fallback to User(role=trainer) if needed.
 */
router.get("/trainers", protect, requireRole("admin"), async (_req, res) => {
    try {
        // 1) prefer Trainer collection
        const trainerDocs = await Trainer.find({})
            .select("_id fullName fullname name email isActive role createdAt")
            .sort({ createdAt: -1 })
            .lean();

        if (trainerDocs && trainerDocs.length) {
            const trainers = trainerDocs.map((t) => ({
                _id: t._id,
                fullName: t.fullName || t.fullname || t.name || "Trainer",
                email: t.email || "",
                isActive: t.isActive !== undefined ? t.isActive : true,
                role: "trainer",
            }));
            return res.json({ trainers });
        }

        // 2) fallback: User collection role=trainer (if you used it earlier)
        const userTrainers = await User.find({ role: "trainer" })
            .select("_id fullName fullname name email isActive role createdAt")
            .sort({ createdAt: -1 })
            .lean();

        const trainers = (userTrainers || []).map((t) => ({
            _id: t._id,
            fullName: t.fullName || t.fullname || t.name || "Trainer",
            email: t.email || "",
            isActive: t.isActive !== undefined ? t.isActive : true,
            role: "trainer",
        }));

        return res.json({ trainers });
    } catch (e) {
        return res.status(500).json({ message: "Failed to load trainers", error: e.message });
    }
});

/**
 * POST /api/admin-messages/chats/open
 * body: { trainerId }
 * ✅ Ensures AdminTrainerChat exists and returns {chat}
 */
router.post("/chats/open", protect, requireRole("admin"), async (req, res) => {
    try {
        const adminId = req.user?._id;
        const { trainerId } = req.body || {};

        if (!adminId) return res.status(401).json({ message: "Unauthorized" });
        if (!trainerId || !mongoose.Types.ObjectId.isValid(trainerId)) {
            return res.status(400).json({ message: "Valid trainerId required" });
        }

        // trainer exists? (Trainer first)
        const trainer =
            (await Trainer.findById(trainerId).select("_id").lean()) ||
            (await User.findOne({ _id: trainerId, role: "trainer" }).select("_id").lean());

        if (!trainer) return res.status(404).json({ message: "Trainer not found" });

        let chat = await AdminTrainerChat.findOne({ adminId, trainerId }).lean();
        if (!chat) {
            const created = await AdminTrainerChat.create({ adminId, trainerId });
            chat = created.toObject();
        }

        return res.json({ chat });
    } catch (e) {
        // duplicate unique index
        if (String(e?.code) === "11000") {
            const chat = await AdminTrainerChat.findOne({
                adminId: req.user?._id,
                trainerId: req.body?.trainerId,
            }).lean();
            return res.json({ chat });
        }

        return res.status(500).json({ message: "Failed to open chat", error: e.message });
    }
});

/**
 * GET /api/admin-messages/chats/:chatId/messages
 */
router.get("/chats/:chatId/messages", protect, requireRole("admin"), async (req, res) => {
    try {
        const adminId = req.user?._id;
        const { chatId } = req.params;

        if (!adminId) return res.status(401).json({ message: "Unauthorized" });
        if (!mongoose.Types.ObjectId.isValid(chatId)) {
            return res.status(400).json({ message: "Invalid chatId" });
        }

        const chat = await AdminTrainerChat.findById(chatId).lean();
        if (!chat) return res.status(404).json({ message: "Chat not found" });
        if (String(chat.adminId) !== String(adminId)) return res.status(403).json({ message: "Forbidden" });

        const messages = await AdminTrainerMessage.find({ chatId }).sort({ createdAt: 1 }).lean();
        return res.json({ messages });
    } catch (e) {
        return res.status(500).json({ message: "Failed to load messages", error: e.message });
    }
});

export default router;
