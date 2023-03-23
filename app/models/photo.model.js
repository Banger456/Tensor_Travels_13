const mongoose = require('mongoose');

const PhotoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming you have a User model
    required: true,
  },
  category: {
    type: String,
    enum: ["Potrait", "Landscape", "Architecture"],
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  approved: {
    type: Boolean,
    default: false,
  },
  votes: { type: Number, default: 0 },
}, {
  timestamps: true,
});

const Photo = mongoose.model('Photo', PhotoSchema);

module.exports = Photo;