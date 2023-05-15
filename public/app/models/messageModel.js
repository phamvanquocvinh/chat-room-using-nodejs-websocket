const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  username: { type: String },
  content: { type: String },
  timestamp: { type: Date },
});

const Message = mongoose.model('Message', messageSchema);
module.exports = { Message }