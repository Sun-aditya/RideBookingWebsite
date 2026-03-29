import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

const connectSocket = (token) => {
  socket.auth = { token };
  if (!socket.connected) {
    socket.connect();
  }

  socket.off("connect");
  socket.off("disconnect");
  socket.off("connect_error");

  socket.on("connect", () => console.log("Socket connected:", socket.id));
  socket.on("disconnect", () => console.log("Socket disconnected"));
  socket.on("connect_error", (err) => console.log("Socket error:", err.message));
};

const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

const emitEvent = (event, data) => {
  socket.emit(event, data);
};

const onEvent = (event, callback) => {
  socket.on(event, callback);
};

const offEvent = (event, callback) => {
  socket.off(event, callback);
};

export { socket, connectSocket, disconnectSocket, emitEvent, onEvent, offEvent };
