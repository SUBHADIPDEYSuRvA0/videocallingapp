const socket = io('/');
const roomId = document.getElementById('roomId').value;
const userId = Date.now(); // You may replace with actual user ID later

let localStream;

// Join the room
socket.emit('join-room', roomId, userId);

socket.on('user-connected', userId => {
  console.log('User connected: ', userId);
});

socket.on('user-disconnected', userId => {
  console.log('User disconnected: ', userId);
});

// Access user camera/mic
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(stream => {
    localStream = stream;

    const video = document.createElement('video');
    video.srcObject = stream;
    video.autoplay = true;
    video.muted = true;
    document.body.appendChild(video);
  })
  .catch(err => {
    console.error('Error accessing media devices.', err);
  });

// Hang Up functionality
document.getElementById('hangupBtn').addEventListener('click', () => {
  // Stop local stream
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
  }

  // Leave the room and redirect
  socket.disconnect();
  window.location.href = '/';
});
