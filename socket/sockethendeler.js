// /socket/sockethendeler.js
module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("New connection:", socket.id);

    socket.on("join-room", ({ roomId, userId }) => {
      socket.join(roomId);
      console.log(`${userId} joined room ${roomId}`);
      
      // Notify others in the room
      socket.to(roomId).emit("user-connected", { userId, socketId: socket.id });

      // Handle signaling data
      socket.on("signal", ({ targetSocketId, signal }) => {
        io.to(targetSocketId).emit("signal", {
          senderSocketId: socket.id,
          signal,
        });
      });

      // Handle disconnect
      socket.on("disconnect", () => {
        console.log(`${userId} disconnected from room ${roomId}`);
        socket.to(roomId).emit("user-disconnected", { userId, socketId: socket.id });
      });
    });
  });
};
