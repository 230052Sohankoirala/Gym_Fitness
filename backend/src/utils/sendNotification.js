// src/utils/sendNotification.js

import Notification from "../models/Notification.js";

/**
 * sendNotification({
 *   user: ObjectId,
 *   role: "member" | "trainer" | "admin",
 *   type: "payment" | "session" | "system",
 *   title: "string",
 *   message: "string",
 *   data: {}   // optional metadata
 * })
 */
export async function sendNotification({
    user,
    role,
    type = "system",
    title,
    message,
    data = {},
}) {
    try {
        if (!role || !title || !message) {
            console.warn("⚠️ Missing fields in sendNotification");
            return null;
        }

        const doc = await Notification.create({
            user: user || undefined, // some admin notifications have no user
            role,
            type,
            title,
            message,
            data,
            isRead: false,
        });

        console.log(`🔔 Notification created → [${role}] ${title}`);

        return doc;
    } catch (err) {
        console.error("❌ Failed to create notification:", err);
        return null;
    }
}
