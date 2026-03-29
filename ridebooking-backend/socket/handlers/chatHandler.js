const chatHandler = (io, socket, connectedRiders, connectedDrivers) => {
  /**
   * Triggered when rider or driver sends a chat message in ride context.
   */
  socket.on("chat:send_message", async (data = {}) => {
    try {
      const { rideId, message, receiverId } = data;

      if (!rideId) {
        socket.emit("error", { message: "rideId is required" });
        return;
      }

      if (!message || typeof message !== "string" || !message.trim()) {
        socket.emit("error", { message: "Message cannot be empty" });
        return;
      }

      if (message.trim().length > 500) {
        socket.emit("error", { message: "Message cannot be longer than 500 characters" });
        return;
      }

      const messageObject = {
        id: Date.now().toString(),
        rideId,
        senderId: socket.userId,
        senderRole: socket.role,
        senderName: socket.user?.fullName,
        message: message.trim(),
        timestamp: new Date(),
        read: false,
      };

      socket.join(`ride_${rideId}`);
      io.to(`ride_${rideId}`).emit("chat:new_message", messageObject);

      if (receiverId) {
        io.to(`user_${receiverId}`).emit("chat:new_message", messageObject);
      }

      console.log(`Chat message in ride ${rideId} from ${socket.user?.fullName}`);
    } catch (error) {
      console.log("chat:send_message error", error.message);
      socket.emit("error", { message: "Failed to send chat message" });
    }
  });

  /**
   * Triggered while user is typing to broadcast typing state to other participant.
   */
  socket.on("chat:typing", async (data = {}) => {
    try {
      const { rideId, isTyping } = data;
      if (!rideId || typeof isTyping !== "boolean") {
        socket.emit("error", { message: "rideId and isTyping(boolean) are required" });
        return;
      }

      socket.to(`ride_${rideId}`).emit("chat:user_typing", {
        userId: socket.userId,
        role: socket.role,
        isTyping,
      });

      console.log(`Typing status in ride ${rideId} by ${socket.userId}: ${isTyping}`);
    } catch (error) {
      console.log("chat:typing error", error.message);
      socket.emit("error", { message: "Failed to update typing status" });
    }
  });

  /**
   * Triggered to mark a specific message as read in ride chat room.
   */
  socket.on("chat:message_read", async (data = {}) => {
    try {
      const { rideId, messageId } = data;
      if (!rideId || !messageId) {
        socket.emit("error", { message: "rideId and messageId are required" });
        return;
      }

      io.to(`ride_${rideId}`).emit("chat:message_seen", {
        messageId,
        readBy: socket.userId,
        timestamp: new Date(),
      });

      console.log(`Message read event in ride ${rideId}, message ${messageId}`);
    } catch (error) {
      console.log("chat:message_read error", error.message);
      socket.emit("error", { message: "Failed to mark message as read" });
    }
  });
};

module.exports = chatHandler;
