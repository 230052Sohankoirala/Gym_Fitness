import Notification from "../models/Notification.js";

/**
 * GET /api/notifications
 * - returns personal + broadcast for the current role
 */
export const getNotifications = async (req, res) => {
  try {
    const role = req.query.role || req.user.role;

    const notifications = await Notification.find({
      $or: [
        // personal
        {
          recipientId: req.user._id,
          recipientModel:
            role === "admin" ? "Admin" : role === "trainer" ? "Trainer" : "User",
        },

        // broadcast to that role
        { recipientId: null, role },
      ],
    })
      .sort({ createdAt: -1 })
      .populate("data.memberId", "fullname email") // ✅ fullname
      .populate("data.trainerId", "name email")    // ✅ trainer fields
      .lean();

    res.json(notifications);
  } catch (err) {
    console.error("Get notifications error:", err);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

/**
 * PATCH /api/notifications/:id/read
 * ✅ ONLY marks personal notifications read
 * (broadcast stays global)
 */
export const markNotificationRead = async (req, res) => {
  try {
    const role = req.user.role;
    const model = role === "admin" ? "Admin" : role === "trainer" ? "Trainer" : "User";

    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.user._id, recipientModel: model },
      { isRead: true },
      { new: true }
    );

    if (!notif) return res.status(404).json({ message: "Notification not found" });

    res.json(notif);
  } catch (err) {
    console.error("Mark notification read error:", err);
    res.status(500).json({ message: "Failed to update notification" });
  }
};

/**
 * PATCH /api/notifications/read-all
 */
export const markAllNotificationsRead = async (req, res) => {
  try {
    const role = req.user.role;
    const model = role === "admin" ? "Admin" : role === "trainer" ? "Trainer" : "User";

    await Notification.updateMany(
      { recipientId: req.user._id, recipientModel: model, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error("Mark all notifications read error:", err);
    res.status(500).json({ message: "Failed to update notifications" });
  }
};

/**
 * DELETE /api/notifications/:id
 */
export const clearNotification = async (req, res) => {
  try {
    const role = req.user.role;
    const model = role === "admin" ? "Admin" : role === "trainer" ? "Trainer" : "User";

    const deleted = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipientId: req.user._id,
      recipientModel: model,
    });

    if (!deleted) return res.status(404).json({ message: "Notification not found" });

    res.json({ message: "Notification deleted" });
  } catch (err) {
    console.error("Delete notification error:", err);
    res.status(500).json({ message: "Failed to delete notification" });
  }
};

/**
 * DELETE /api/notifications
 */
export const clearAllNotifications = async (req, res) => {
  try {
    const role = req.user.role;
    const model = role === "admin" ? "Admin" : role === "trainer" ? "Trainer" : "User";

    await Notification.deleteMany({ recipientId: req.user._id, recipientModel: model });

    res.json({ message: "All notifications cleared" });
  } catch (err) {
    console.error("Clear all notifications error:", err);
    res.status(500).json({ message: "Failed to clear notifications" });
  }
};
