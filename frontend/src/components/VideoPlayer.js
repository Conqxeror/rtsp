import React, { useRef, useEffect } from "react";
import videojs from "video.js";
import "@videojs/http-streaming";

const VideoPlayer = ({ streamUrl }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    const videoElement = videoRef.current;

    // Only initialize if element exists and streamUrl is valid
    if (!videoElement || !streamUrl) return;

    console.log("Initializing video player with URL:", streamUrl);

    const player = (playerRef.current = videojs(
      videoElement,
      {
        controls: true,
        autoplay: true,
        preload: "auto",
        fluid: true,
        responsive: true,
        html5: {
          hls: {
            enableLowInitialPlaylist: true,
            smoothQualityChange: true,
            overrideNative: true,
          },
        },
        sources: [
          {
            src: streamUrl,
            type: "application/x-mpegURL",
          },
        ],
      },
      () => {
        console.log("Player ready");
      }
    ));

    // Enhanced error handling
    player.on("error", (error) => {
      const playerError = player.error();
      console.error("Player error:", playerError);
      console.error("Error details:", {
        code: playerError?.code,
        message: playerError?.message,
        metadata: playerError?.metadata,
      });
    });

    // Add loading state handling
    player.on("loadstart", () => {
      console.log("Video loading started");
    });

    player.on("loadeddata", () => {
      console.log("Video data loaded");
    });

    player.on("canplay", () => {
      console.log("Video can start playing");
    });

    player.on("waiting", () => {
      console.log("Video is waiting for data");
    });

    player.on("playing", () => {
      console.log("Video is playing");
    });

    // Try to load the source explicitly
    player.ready(() => {
      console.log("Player is ready, loading source");
      player.src({
        src: streamUrl,
        type: "application/x-mpegURL",
      });
    });

    return () => {
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [streamUrl]);

  return (
    <div data-vjs-player style={{ width: "100%", height: "100%" }}>
      <video
        ref={videoRef}
        className="video-js vjs-big-play-centered"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default VideoPlayer;
