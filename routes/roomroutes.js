const express = require('express');
const router = express.Router();
const roomController = require('../controller/roomcontroller');
const users = require('../models/user');
const rooms = require('../models/room');

// Create room route
router.post('/create', roomController.createRoom);

// Join room route
router.post('/join', roomController.joinRoom);

// Get room by code route
router.get('/:code', async (req, res) => {
  try {
    const roomCode = req.params.code;

    // Find the room by code
    const room = await rooms.findOne({ code: roomCode });

    if (!room) {
      return res.status(404).send('Room not found');
    }

    // Find the user associated with the room (if any)
    const user = req.session.user;  // Assuming user is stored in session

    if (!user) {
      return res.status(404).send('User not found');
    }

    // Render the call page with the room code and user info
    res.render('call', { 
      code: roomCode, 
      user: user // Pass the user object to the view
    });

  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});


module.exports = router;
