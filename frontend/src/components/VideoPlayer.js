import React, { useRef, useEffect } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

const VideoPlayer = ({ streamUrl }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current || !streamUrl) return;

    // Small delay to ensure DOM is ready
    const initPlayer = () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }

      const player = videojs(videoRef.current, {
        autoplay: true,
        controls: true,
        responsive: true,
        fluid: true,
        preload: "auto",
        liveui: true,
        html5: {
          hls: {
            overrideNative: true,
          },
        },
        sources: [
          {
            src: streamUrl,
            type: "application/x-mpegURL",
          },
        ],
      });

      playerRef.current = player;

      // Debugging logs
      player.on("loadedmetadata", () => console.log("Metadata loaded"));
      player.on("canplay", () => console.log("Stream can play"));
      player.on("playing", () => console.log("Video is playing"));
      player.on("error", () => console.error("VideoJS Error:", player.error()));
    };

    const timeoutId = setTimeout(initPlayer, 100); // wait for 100ms

    return () => {
      clearTimeout(timeoutId);
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [streamUrl]);

  return (
    <div data-vjs-player style={{ width: "100%", height: "100%" }}>
      <video
        ref={videoRef}
        className="video-js vjs-default-skin vjs-big-play-centered"
        playsInline
      />
    </div>
  );
};

export default VideoPlayer;
