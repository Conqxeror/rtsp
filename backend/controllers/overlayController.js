const Overlay = require("../models/overlay.js");

// Create overlay
exports.createOverlay = async (req, res) => {
  try {
    const overlay = new Overlay(req.body);
    await overlay.save();
    res.status(201).json(overlay);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all overlays
exports.getOverlays = async (req, res) => {
  try {
    const overlays = await Overlay.find();
    res.json(overlays);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update overlay
exports.updateOverlay = async (req, res) => {
  try {
    const overlay = await Overlay.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!overlay) return res.status(404).json({ error: "Overlay not found" });
    res.json(overlay);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete overlay
exports.deleteOverlay = async (req, res) => {
  try {
    const overlay = await Overlay.findByIdAndDelete(req.params.id);
    if (!overlay) return res.status(404).json({ error: "Overlay not found" });
    res.json({ message: "Overlay deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
