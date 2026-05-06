import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:4000";

let socket = null;

export const connectSocket = (token) => {
    if (socket) return socket;

    socket = io(SOCKET_URL, {
        transports: ["websocket"],
        auth: { token },
        autoConnect: true,
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
