import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

let socket = null;

export const connectSocket = (token) => {
    if (socket) return socket;

    socket = io(SOCKET_URL, {
        transports: ["websocket", "polling"],
        auth: {
            token,
        },
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 8,
        reconnectionDelay: 600,
        timeout: 12000,
        withCredentials: true,
    });

    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};