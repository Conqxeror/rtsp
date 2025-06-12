const ffmpeg = require("fluent-ffmpeg");
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const fs = require("fs");
const path = require("path");

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const outputDir =
  process.env.NODE_ENV === "test"
    ? "./test_streams"
    : process.env.STREAM_OUTPUT_DIR || "./public/streams";

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Active streams tracker
const activeStreams = {};

// Helper function to wait for file creation
const waitForFile = (filePath, timeout = 30000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const checkFile = () => {
      if (fs.existsSync(filePath)) {
        // Also check if file has content
        const stats = fs.statSync(filePath);
        if (stats.size > 0) {
          resolve(true);
          return;
        }
      }

      if (Date.now() - startTime > timeout) {
        reject(new Error("Timeout waiting for stream file"));
        return;
      }

      setTimeout(checkFile, 1000);
    };

    checkFile();
  });
};

exports.startStream = async (req, res) => {
  const { rtspUrl } = req.body;

  if (!rtspUrl) {
    return res.status(400).json({ error: "RTSP URL is required" });
  }

  console.log("Starting stream for RTSP URL:", rtspUrl);

  // Generate unique stream ID
  const streamId = Date.now().toString();
  const outputPath = path.join(outputDir, streamId);
  const playlistPath = path.join(outputPath, "index.m3u8");

  // Create stream directory
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  console.log("Stream output directory:", outputPath);

  // Enhanced FFmpeg options for better RTSP handling
  const outputOptions = [
    "-c:v libx264",
    "-preset ultrafast", // ⬅️ Fallback to fastest preset
    "-tune zerolatency",
    "-pix_fmt yuv420p", // ⬅️ Necessary for many players
    "-movflags +faststart", // ⬅️ Ensure stream is seekable (optional)
    "-c:a aac",
    "-ac 2",
    "-ar 44100",
    "-f hls",
    "-hls_time 4",
    "-hls_list_size 6",
    "-hls_flags delete_segments+independent_segments",
    "-hls_segment_type mpegts",
    "-hls_base_url ./",
    "-force_key_frames expr:gte(t,n_forced*4)",
  ];

  try {
    const command = ffmpeg(rtspUrl)
      .inputOptions([
        "-rtsp_transport tcp",
        "-stimeout 5000000", // 5 second timeout
        "-fflags +genpts", // Generate presentation timestamps
      ])
      .outputOptions(outputOptions)
      .output(playlistPath)
      .on("start", (commandLine) => {
        console.log("FFmpeg started with command:", commandLine);
        activeStreams[streamId] = command;
      })
      .on("progress", (progress) => {
        console.log(`Stream ${streamId} progress:`, progress.timemark);
      })
      .on("stderr", (stderr) => {
        // Only log important stderr messages
        if (stderr.includes("error") || stderr.includes("failed")) {
          console.log("FFmpeg stderr:", stderr);
        }
      })
      .on("error", (err) => {
        console.error(`FFmpeg error for stream ${streamId}:`, err.message);
        delete activeStreams[streamId];
      })
      .on("end", () => {
        console.log(`FFmpeg finished processing stream ${streamId}`);
        delete activeStreams[streamId];
      });

    // Start the conversion
    command.run();

    // Wait for the playlist file to be created and have content
    try {
      await waitForFile(playlistPath, 15000);
      console.log(`Stream ${streamId} playlist created successfully`);

      // Verify the file exists and log its contents for debugging
      if (fs.existsSync(playlistPath)) {
        const content = fs.readFileSync(playlistPath, "utf8");
        console.log(`Playlist content preview:`, content.substring(0, 200));
      }

      res.json({
        streamId: streamId,
        streamUrl: `/streams/${streamId}/index.m3u8`,
        message: "Stream conversion started successfully",
        debugUrl: `/debug/streams/${streamId}`,
      });
    } catch (waitError) {
      console.error("Error waiting for stream file:", waitError.message);
      res.status(500).json({
        error: "Stream file not generated in time",
        details: waitError.message,
        streamId: streamId,
      });
    }
  } catch (error) {
    console.error("Error starting stream:", error);
    res.status(500).json({
      error: "Failed to start stream",
      details: error.message,
    });
  }
};

// Get stream status
exports.getStreamStatus = (req, res) => {
  const { streamId } = req.params;
  const streamPath = path.join(outputDir, streamId);
  const playlistPath = path.join(streamPath, "index.m3u8");

  const status = {
    streamId,
    active: !!activeStreams[streamId],
    directoryExists: fs.existsSync(streamPath),
    playlistExists: fs.existsSync(playlistPath),
  };

  if (status.playlistExists) {
    const files = fs.readdirSync(streamPath);
    status.files = files;
    status.fileCount = files.length;
  }

  res.json(status);
};

// Stop a specific stream
exports.stopStream = (req, res) => {
  const { streamId } = req.params;

  if (activeStreams[streamId]) {
    activeStreams[streamId].kill("SIGINT");
    delete activeStreams[streamId];
    res.json({ message: `Stream ${streamId} stopped` });
  } else {
    res.status(404).json({ error: "Stream not found or already stopped" });
  }
};

// Stop all streams (for cleanup)
exports.stopAllStreams = () => {
  Object.keys(activeStreams).forEach((streamId) => {
    activeStreams[streamId].kill("SIGINT");
    delete activeStreams[streamId];
  });
  console.log("All streams stopped");
};
