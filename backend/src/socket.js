// src/socket.js
import { io } from "socket.io-client";

const SOCKET_BASE = "http://localhost:4000";

let socket = null;

/**
 * Create (or re-create) socket connection with JWT token
 * @param {string} token
 * @returns {import("socket.io-client").Socket}
 */
export function connectSocket(token) {
    if (!token) {
        console.log("❌ connectSocket: token missing");
        return null;
    }

    // ✅ if exists, disconnect first to avoid duplicate sockets
    if (socket) {
        try {
            socket.disconnect();
        } catch (e) { }
        socket = null;
    }

    socket = io(SOCKET_BASE, {
        auth: { token }, // ✅ REQUIRED for your backend middleware
        transports: ["websocket", "polling"],
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 800,
        timeout: 20000,
    });

    // ✅ logs that show EXACT reason
    socket.on("connect", () => console.log("✅ socket connected:", socket.id));
    socket.on("connect_error", (err) =>
        console.log("❌ socket connect_error:", err?.message, err)
    );
    socket.on("disconnect", (reason) =>
        console.log("🔴 socket disconnected:", reason)
    );

    return socket;
}

/**
 * Get current socket instance
 */
export function getSocket() {
    return socket;
}

/**
 * Clean disconnect
 */
export function disconnectSocket() {
    if (!socket) return;
    try {
        socket.disconnect();
    } catch (e) { }
    socket = null;
}
