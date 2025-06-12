const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const routes = require("./routes");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api", routes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Routes
app.get("/", (req, res) => {
  res.send("Livestream API Running");
});

app.use(
  "/streams",
  express.static(path.join(__dirname, "public/streams"), {
    setHeaders: (res) => {
      res.set("Access-Control-Allow-Origin", "*");
    },
  })
);

app.get("/streams/:folder/:file", (req, res) => {
  const filePath = path.join(
    __dirname,
    "public/streams",
    req.params.folder,
    req.params.file
  );

  // Set proper content types
  if (req.params.file.endsWith(".m3u8")) {
    res.set("Content-Type", "application/vnd.apple.mpegurl");
  } else if (req.params.file.endsWith(".ts")) {
    res.set("Content-Type", "video/MP2T");
  }

  res.sendFile(filePath);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;