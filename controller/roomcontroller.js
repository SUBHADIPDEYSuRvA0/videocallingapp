const Room = require('../models/room');
const generateCode = require('../utils/genaratecode');

exports.createRoom = async (req, res) => {
  try {
    const code = generateCode(); // Generate a unique code for the room
    const email = req.session.user.email; // Assuming session stores user email

    // Create a new room and store the email of the user in participants
    await Room.create({ code, participants: [email] });

    // Redirect to the room with the generated code
    res.redirect(`/room/${code}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

exports.joinRoom = async (req, res) => {
  try {
    const { code } = req.body; // Room code from the request body
    const email = req.session.user.email; // Assuming session stores user email

    // Find the room by its code
    const room = await Room.findOne({ code });

    // If the room doesn't exist, send a 404 response
    if (!room) {
      return res.status(404).send('Room not found');
    }

    // If the user isn't already in the room, add them
    if (!room.participants.includes(email)) {
      room.participants.push(email);
      await room.save();
    }

    // Redirect to the room with the provided code
    res.redirect(`/room/${code}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};
