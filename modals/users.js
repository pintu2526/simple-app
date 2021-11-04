const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  isVerified: { type: Boolean, default: false }
});

const User = mongoose.model('User', userSchema);
module.exports = User;