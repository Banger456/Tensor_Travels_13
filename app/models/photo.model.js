const mongoose = require('mongoose');
const Category = require("./category.model");

const PhotoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
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
  category: {
    type: String,
    ref: "Category",
    required: true,
  },
  approved: {
    type: Boolean,
    default: false,
  },
  votes: {
    type: Number,
    default: 0,
  },
  reports: {
    type: Number,
    default: 0,
  },
  canBeReported: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const Photo = mongoose.model('Photo', PhotoSchema);

module.exports = Photo;