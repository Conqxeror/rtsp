const mongoose = require("mongoose");

const overlaySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["text", "image"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
  },
  size: {
    width: { type: Number, default: 100 },
    height: { type: Number, default: 50 },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Overlay", overlaySchema);
