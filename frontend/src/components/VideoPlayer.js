// frontend/src/components/VideoPlayer.js
import React, { useRef, useEffect } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import OverlayEditor from "./OverlayEditor"; // Import OverlayEditor

const VideoPlayer = ({
  streamUrl,
  overlays,
  onAddOverlay,
  onUpdateOverlay,
  onDelete,
}) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const videoContainerRef = useRef(null); // Ref for the video player container

  useEffect(() => {
    if (!videoRef.current || !streamUrl) return;

    if (playerRef.current) {
      playerRef.current.dispose();
    }

    const player = videojs(videoRef.current, {
      autoplay: true,
      controls: true,
      responsive: true,
      fluid: true,
      sources: [
        {
          src: streamUrl,
          type: "application/x-mpegURL",
        },
      ],
    });

    playerRef.current = player;

    player.on("error", () => console.error("VideoJS Error:", player.error()));

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [streamUrl]);

  return (
    <div
      data-vjs-player
      ref={videoContainerRef} // Assign ref to the container
      style={{
        position: "relative", // Crucial for absolute positioning of overlays
        width: "100%",
        height: "100%",
        minHeight: "450px",
        backgroundColor: "#000",
        borderRadius: "8px",
      }}
    >
      <video
        ref={videoRef}
        className="video-js vjs-default-skin vjs-big-play-centered"
        playsInline
      />
      {/* OverlayEditor rendered directly within the video container */}
      <OverlayEditor
        overlays={overlays}
        onAddOverlay={onAddOverlay}
        onUpdateOverlay={onUpdateOverlay}
        onDelete={onDelete}
        boundsRef={videoContainerRef} // Pass the video container ref as bounds
      />
    </div>
  );
};

export default VideoPlayer;
