// src/controllers/feedbackController.js
import Feedback from "../models/Feedback.js";

/* ---------------- Helpers ---------------- */
const safeStr = (v) => String(v ?? "").trim();
const clampInt = (v, def, min, max) => {
    const n = parseInt(v, 10);
    if (Number.isNaN(n)) return def;
    return Math.max(min, Math.min(max, n));
};

/* ---------------- USER: Submit feedback ---------------- */
export const submitFeedback = async (req, res) => {
    try {
        const message = safeStr(req.body?.message);
        const category = safeStr(req.body?.category) || "other";
        const priority = safeStr(req.body?.priority) || "medium";

        if (!message || message.length < 10) {
            return res.status(400).json({ message: "Feedback must be at least 10 characters." });
        }
        if (message.length > 500) {
            return res.status(400).json({ message: "Feedback must be at most 500 characters." });
        }

        const user = req.user?._id || null;

        const fb = await Feedback.create({
            user,
            nameSnapshot: safeStr(req.user?.fullName || req.user?.name || ""),
            emailSnapshot: safeStr(req.user?.email || ""),
            message,
            category,
            priority,
            meta: {
                appVersion: safeStr(req.body?.appVersion || ""),
                platform: safeStr(req.body?.platform || "web"),
                userAgent: safeStr(req.headers["user-agent"] || ""),
                ip: safeStr(req.ip || ""),
            },
        });

        return res.status(201).json({
            message: "Feedback submitted successfully",
            feedback: {
                _id: fb._id,
                status: fb.status,
                createdAt: fb.createdAt,
            },
        });
    } catch (err) {
        return res.status(500).json({ message: err?.message || "Server error" });
    }
};

/* ---------------- ADMIN: List feedback (filters + pagination) ---------------- */
export const listFeedbackAdmin = async (req, res) => {
    try {
        const page = clampInt(req.query?.page, 1, 1, 9999);
        const limit = clampInt(req.query?.limit, 10, 5, 50);
        const skip = (page - 1) * limit;

        const status = safeStr(req.query?.status);
        const category = safeStr(req.query?.category);
        const priority = safeStr(req.query?.priority);
        const q = safeStr(req.query?.q);

        const filter = {};
        if (status) filter.status = status;
        if (category) filter.category = category;
        if (priority) filter.priority = priority;

        // search by text index (message/name/email) or fallback regex
        let findQuery = Feedback.find(filter);

        if (q) {
            // if text index available
            findQuery = Feedback.find({
                ...filter,
                $or: [
                    { message: { $regex: q, $options: "i" } },
                    { nameSnapshot: { $regex: q, $options: "i" } },
                    { emailSnapshot: { $regex: q, $options: "i" } },
                ],
            });
        }

        const [rows, total] = await Promise.all([
            findQuery
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Feedback.countDocuments(
                q
                    ? {
                        ...filter,
                        $or: [
                            { message: { $regex: q, $options: "i" } },
                            { nameSnapshot: { $regex: q, $options: "i" } },
                            { emailSnapshot: { $regex: q, $options: "i" } },
                        ],
                    }
                    : filter
            ),
        ]);

        return res.json({
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            feedback: rows,
        });
    } catch (err) {
        return res.status(500).json({ message: err?.message || "Server error" });
    }
};

/* ---------------- ADMIN: Get single feedback ---------------- */
export const getFeedbackAdmin = async (req, res) => {
    try {
        const fb = await Feedback.findById(req.params.id).lean();
        if (!fb) return res.status(404).json({ message: "Feedback not found" });
        return res.json({ feedback: fb });
    } catch (err) {
        return res.status(500).json({ message: err?.message || "Server error" });
    }
};

/* ---------------- ADMIN: Update status / admin note ---------------- */
export const updateFeedbackAdmin = async (req, res) => {
    try {
        const status = safeStr(req.body?.status);
        const adminNote = safeStr(req.body?.adminNote);

        const patch = {};
        if (status) patch.status = status;
        if (adminNote) patch.adminNote = adminNote;

        const updated = await Feedback.findByIdAndUpdate(req.params.id, patch, {
            new: true,
            runValidators: true,
        }).lean();

        if (!updated) return res.status(404).json({ message: "Feedback not found" });

        return res.json({ message: "Feedback updated", feedback: updated });
    } catch (err) {
        return res.status(500).json({ message: err?.message || "Server error" });
    }
};

/* ---------------- ADMIN: Delete feedback ---------------- */
export const deleteFeedbackAdmin = async (req, res) => {
    try {
        const removed = await Feedback.findByIdAndDelete(req.params.id).lean();
        if (!removed) return res.status(404).json({ message: "Feedback not found" });
        return res.json({ message: "Feedback deleted" });
    } catch (err) {
        return res.status(500).json({ message: err?.message || "Server error" });
    }
};