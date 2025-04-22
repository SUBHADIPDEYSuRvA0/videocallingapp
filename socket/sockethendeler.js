module.exports = function (io) {
    io.on('connection', socket => {
      socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId);
  
        socket.on('offer', (roomId, senderId, offer) => {
          socket.to(roomId).emit('offer', senderId, offer);
        });
  
        socket.on('answer', (roomId, senderId, answer) => {
          socket.to(roomId).emit('answer', senderId, answer);
        });
  
        socket.on('ice-candidate', (roomId, senderId, candidate) => {
          socket.to(roomId).emit('ice-candidate', senderId, candidate);
        });
  
        socket.on('disconnect', () => {
          socket.to(roomId).emit('user-disconnected', userId);
        });
      });
    });
  };
  