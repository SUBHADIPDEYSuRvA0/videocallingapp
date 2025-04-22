// controllers/roomController.js
const Room = require('../models/room');
const generateCode = require('../utils/genaratecode');

exports.createRoom = async (req, res) => {
  const code = generateCode();
  await Room.create({ code, participants: [req.session.user.email] });
  res.redirect(`/room/${code}`);
};

exports.joinRoom = async (req, res) => {
  const { code } = req.body;
  const room = await Room.findOne({ code });
  if (!room) return res.status(404).send('Room not found');
  if (!room.participants.includes(req.session.user.email)) {
    room.participants.push(req.session.user.email);
    await room.save();
  }
  res.redirect(`/room/${code}`);
};
