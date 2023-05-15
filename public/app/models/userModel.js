const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    fullname: { type: String },
    password: { type: String, required: true },
    status: { type: Boolean, default: false },
  });

const User = mongoose.model('User', userSchema);
module.exports = { User }