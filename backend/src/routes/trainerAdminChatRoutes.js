import express from "express";
import Admin from "../models/Admin.js";
import AdminTrainerChat from "../models/AdminTrainerChat.js";
import AdminTrainerMessage from "../models/AdminTrainerMessage.js";
import { protect } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";

const router = express.Router();

/** GET /api/trainer/admin-contact */
router.get("/admin-contact", protect, requireRole("trainer"), async (req, res) => {
  try {
    const admin = await Admin.findOne({}).select("_id email fullname fullName name role").lean();
    if (!admin) return res.status(404).json({ message: "Admin account not found" });

    const fullName = admin.fullname || admin.fullName || admin.name || "Admin";
    return res.json({ admin: { _id: admin._id, email: admin.email, fullName, role: "admin" } });
  } catch (e) {
    return res.status(500).json({ message: "Failed to load admin", error: e.message });
  }
});

/** POST /api/trainer/admin-chat/open */
router.post("/admin-chat/open", protect, requireRole("trainer"), async (req, res) => {
  try {
    const trainerId = req.user?._id; // ✅ FIX
    if (!trainerId) return res.status(401).json({ message: "Unauthorized" });

    const admin = await Admin.findOne({}).select("_id").lean();
    if (!admin) return res.status(404).json({ message: "Admin account not found" });

    let chat = await AdminTrainerChat.findOne({ adminId: admin._id, trainerId }).lean();
    if (!chat) {
      const created = await AdminTrainerChat.create({ adminId: admin._id, trainerId });
      chat = created.toObject();
    }

    return res.json({ chat });
  } catch (e) {
    return res.status(500).json({ message: "Failed to open admin chat", error: e.message });
  }
});

/** GET /api/trainer/admin-chat/:chatId/messages */
router.get("/admin-chat/:chatId/messages", protect, requireRole("trainer"), async (req, res) => {
  try {
    const trainerId = req.user?._id; // ✅ FIX
    const { chatId } = req.params;

    if (!trainerId) return res.status(401).json({ message: "Unauthorized" });

    const chat = await AdminTrainerChat.findById(chatId).lean();
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    if (String(chat.trainerId) !== String(trainerId)) return res.status(403).json({ message: "Forbidden" });

    const messages = await AdminTrainerMessage.find({ chatId }).sort({ createdAt: 1 }).lean();
    return res.json({ messages });
  } catch (e) {
    return res.status(500).json({ message: "Failed to load messages", error: e.message });
  }
});

export default router;
