const socket = io('/');
const roomId = document.getElementById('roomId').value;
const userId = Date.now();
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');

let localStream;
let peerConnection;
const config = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(stream => {
    localStream = stream;
    localVideo.srcObject = stream;

    socket.emit('join-room', roomId, userId);

    socket.on('user-connected', async (otherUserId) => {
      console.log('User connected:', otherUserId);
      peerConnection = new RTCPeerConnection(config);

      // Add local tracks
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });

      // When remote stream arrives
      peerConnection.ontrack = event => {
        remoteVideo.srcObject = event.streams[0];
      };

      // ICE candidate to signaling server
      peerConnection.onicecandidate = event => {
        if (event.candidate) {
          socket.emit('ice-candidate', roomId, userId, event.candidate);
        }
      };

      // Create offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      socket.emit('offer', roomId, userId, offer);
    });

    socket.on('offer', async (senderId, offer) => {
      peerConnection = new RTCPeerConnection(config);

      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });

      peerConnection.ontrack = event => {
        remoteVideo.srcObject = event.streams[0];
      };

      peerConnection.onicecandidate = event => {
        if (event.candidate) {
          socket.emit('ice-candidate', roomId, userId, event.candidate);
        }
      };

      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      socket.emit('answer', roomId, userId, answer);
    });

    socket.on('answer', async (senderId, answer) => {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on('ice-candidate', async (senderId, candidate) => {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error('Error adding received ICE candidate', err);
      }
    });
  })
  .catch(err => {
    console.error('Failed to get local stream', err);
  });
