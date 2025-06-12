const express = require("express");
const router = express.Router();
const overlayController = require("./controllers/overlayController");
const streamController = require("./controllers/streamController");

// Overlay routes
router.post("/overlays", overlayController.createOverlay);
router.get("/overlays", overlayController.getOverlays);
router.put("/overlays/:id", overlayController.updateOverlay);
router.delete("/overlays/:id", overlayController.deleteOverlay);

// Stream routes
router.post("/stream/start", streamController.startStream);
router.get("/stream/status/:streamId", streamController.getStreamStatus);
router.post("/stream/stop/:streamId", streamController.stopStream);

module.exports = router;
