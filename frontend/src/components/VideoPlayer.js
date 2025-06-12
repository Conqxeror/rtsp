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

    const player = (playerRef.current = videojs(
      videoElement,
      {
        controls: true,
        autoplay: true,
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

    player.on("error", () => {
      console.error("Player error:", player.error());
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, [streamUrl]);

  return (
    <div data-vjs-player>
      <video ref={videoRef} className="video-js vjs-big-play-centered" />
    </div>
  );
};

export default VideoPlayer;
