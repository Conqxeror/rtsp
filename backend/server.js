const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const routes = require("./routes");

dotenv.config();

const app = express();

// Enhanced CORS configuration
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use("/api", routes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.get("/", (req, res) => {
  res.send("Livestream API Running");
});

// Enhanced static file serving for streams
app.use(
  "/streams",
  (req, res, next) => {
    // Set CORS headers for all stream requests
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET");
    res.header("Access-Control-Allow-Headers", "Content-Type");

    // Set cache control
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", "0");

    next();
  },
  express.static(path.join(__dirname, "public/streams"))
);

// Specific route for stream files with proper headers
app.get("/streams/:streamId/:filename", (req, res) => {
  const { streamId, filename } = req.params;
  const filePath = path.join(__dirname, "public/streams", streamId, filename);

  console.log("Stream request for:", filePath);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.log("File not found:", filePath);
    return res.status(404).json({ error: "Stream file not found" });
  }

  // Set appropriate content type and headers
  if (filename.endsWith(".m3u8")) {
    res.set({
      "Content-Type": "application/vnd.apple.mpegurl",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });
  } else if (filename.endsWith(".ts")) {
    res.set({
      "Content-Type": "video/MP2T",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=60",
    });
  }

  res.sendFile(filePath);
});

// Debug route to check stream directory
app.get("/debug/streams/:streamId", (req, res) => {
  const { streamId } = req.params;
  const streamPath = path.join(__dirname, "public/streams", streamId);

  if (!fs.existsSync(streamPath)) {
    return res.status(404).json({ error: "Stream directory not found" });
  }

  const files = fs.readdirSync(streamPath);
  res.json({ streamId, files, path: streamPath });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(
    `Stream files will be served from: ${path.join(
      __dirname,
      "public/streams"
    )}`
  );
});

module.exports = app;
