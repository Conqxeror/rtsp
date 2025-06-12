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

exports.startStream = (req, res) => {
  const { rtspUrl } = req.body;

  if (!rtspUrl) {
    return res.status(400).json({ error: "RTSP URL is required" });
  }

  // Generate unique stream ID
  const streamId = Date.now().toString();
  const outputPath = path.join(outputDir, streamId);

  // Create stream directory
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  const outputOptions = [
    "-c:v copy",
    "-c:a aac",
    "-f hls",
    "-hls_time 4",
    "-hls_list_size 6",
    "-hls_flags delete_segments",
    "-hls_segment_type mpegts",
    "-hls_base_url ./", // Important for relative paths
  ];

  const command = ffmpeg(rtspUrl)
    .inputOptions("-rtsp_transport", "tcp")
    .outputOptions(outputOptions)
    .output(`${outputPath}/index.m3u8`)
    .on("start", (commandLine) => {
      console.log("FFmpeg command:", commandLine);
    })
    .on("progress", (progress) => {
      console.log("Processing:", progress.timemark);
    })
    .on("stderr", (stderr) => {
      console.log("FFmpeg stderr:", stderr);
    })
    .on("error", (err) => {
      console.error("FFmpeg error:", err.message);
    })
    .on("end", () => {
      console.log("FFmpeg finished processing");
      // Verify files were created
      fs.readdir(outputPath, (err, files) => {
        if (err) {
          console.error("Could not list directory:", err);
        } else {
          console.log("Generated files:", files);
        }
      });
    });

  command.run();

  res.json({
    streamUrl: `/streams/${streamId}/index.m3u8`,
    message: "Stream conversion started",
  });

  // Log stream directory contents for debugging
  fs.readdir(outputPath, (err, files) => {
    if (err) {
      console.error("Error reading stream directory:", err);
    } else {
      console.log("Stream directory contents:", files);
    }
  });
};

exports.stopAllStreams = () => {
  Object.values(activeStreams).forEach((stream) => {
    stream.kill("SIGINT");
  });
};
