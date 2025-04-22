const socket = io('/');
const roomId = document.getElementById('roomId').value;
const userId = Date.now().toString();
const localVideo = document.getElementById('localVideo');
const remoteContainer = document.getElementById('remoteVideosContainer');
const hangupBtn = document.getElementById('hangupBtn');

let localStream;
const peers = {}; // { socketId: RTCPeerConnection }

const config = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

// Get media stream
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(stream => {
    localStream = stream;
    localVideo.srcObject = stream;
    socket.emit('join-room', roomId, userId);
  })
  .catch(err => {
    console.error('Failed to get local stream', err);
  });

// When new user connects
socket.on('user-connected', async (otherUserId) => {
  const peer = createPeer(otherUserId);
  peers[otherUserId] = peer;

  localStream.getTracks().forEach(track => {
    peer.addTrack(track, localStream);
  });

  const offer = await peer.createOffer();
  await peer.setLocalDescription(offer);
  socket.emit('offer', roomId, userId, otherUserId, offer);
});

// When offer received
socket.on('offer', async (senderId, receiverId, offer) => {
  const peer = createPeer(senderId);
  peers[senderId] = peer;

  localStream.getTracks().forEach(track => {
    peer.addTrack(track, localStream);
  });

  await peer.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await peer.createAnswer();
  await peer.setLocalDescription(answer);
  socket.emit('answer', roomId, userId, senderId, answer);
});

// When answer received
socket.on('answer', async (senderId, receiverId, answer) => {
  if (peers[senderId]) {
    await peers[senderId].setRemoteDescription(new RTCSessionDescription(answer));
  }
});

// When ICE candidate received
socket.on('ice-candidate', async (senderId, receiverId, candidate) => {
  if (peers[senderId]) {
    try {
      await peers[senderId].addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.error('Error adding ICE candidate:', err);
    }
  }
});

// Create peer connection
function createPeer(peerId) {
  const peer = new RTCPeerConnection(config);

  peer.onicecandidate = event => {
    if (event.candidate) {
      socket.emit('ice-candidate', roomId, userId, peerId, event.candidate);
    }
  };

  peer.ontrack = event => {
    let remoteVideo = document.getElementById(`video-${peerId}`);
    if (!remoteVideo) {
      remoteVideo = document.createElement('video');
      remoteVideo.id = `video-${peerId}`;
      remoteVideo.autoplay = true;
      remoteVideo.classList.add('remote-video');
      remoteContainer.appendChild(remoteVideo);
    }
    remoteVideo.srcObject = event.streams[0];
  };

  return peer;
}

// Hangup functionality
hangupBtn.addEventListener('click', () => {
  // Stop local stream
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
  }

  // Close all peer connections
  for (const peerId in peers) {
    if (peers[peerId]) {
      peers[peerId].close();
      delete peers[peerId];
    }

    const remoteVideo = document.getElementById(`video-${peerId}`);
    if (remoteVideo) {
      remoteVideo.remove();
    }
  }

  localVideo.srcObject = null;

  // Optionally, leave room or go back to home
  socket.emit('leave-room', roomId, userId);
  window.location.href = '/';
});
