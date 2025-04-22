const mongoose = require('mongoose');
const roomSchema = new mongoose.Schema({
  code: String,
  participants: [String] // user emails
});
module.exports = mongoose.model('Room', roomSchema);
