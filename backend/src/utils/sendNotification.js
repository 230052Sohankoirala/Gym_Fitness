import Notification from "../models/Notification.js";

/**
 * sendNotification({
 *   recipientId: ObjectId | null,
 *   recipientModel: "User" | "Trainer" | "Admin",
 *   role: "member" | "trainer" | "admin",
 *   type, title, message, data, important
 * })
 */
export async function sendNotification({
  recipientId = null,
  recipientModel = "User",
  role,
  type = "system",
  title,
  message,
  data = {},
  important = false,
}) {
  try {
    if (!role || !title || !message) {
      console.warn("⚠️ Missing fields in sendNotification");
      return null;
    }

    const doc = await Notification.create({
      recipientId,
      recipientModel,
      role,
      type,
      title,
      message,
      data,
      important,
      isRead: false,
    });

    console.log(`🔔 Notification created → [${role}] ${type}: ${title}`);
    return doc;
  } catch (err) {
    console.error("❌ Failed to create notification:", err);
    return null;
  }
}
