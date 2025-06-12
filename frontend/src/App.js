import React, { useState, useEffect } from "react";
import axios from "axios";
import VideoPlayer from "./components/VideoPlayer";
import OverlayEditor from "./components/OverlayEditor";
import "./App.css";

function App() {
  const [streamUrl, setStreamUrl] = useState("");
  const [overlays, setOverlays] = useState([]);
  const [rtspInput, setRtspInput] = useState("");
  const [streamStatus, setStreamStatus] = useState("idle"); // 'idle', 'loading', 'active', 'error'

  // Fetch saved overlays on mount
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/overlays")
      .then((res) => setOverlays(res.data))
      .catch(console.error);
  }, []);

  const startStream = () => {
    setStreamStatus("loading");
    axios
      .post("http://localhost:5000/api/stream/start", { rtspUrl: rtspInput })
      .then((res) => {
        setStreamUrl(`http://localhost:5000${res.data.streamUrl}`);
        setStreamStatus("active");
      })
      .catch((err) => {
        console.error(err);
        setStreamStatus("error");
      });
  };

  const handleAddOverlay = (overlay) => {
    axios
      .post("http://localhost:5000/api/overlays", overlay)
      .then((res) => setOverlays([...overlays, res.data]))
      .catch(console.error);
  };

  const handleDeleteOverlay = (index) => {
    const overlayToDelete = overlays[index];
    axios
      .delete(`http://localhost:5000/api/overlays/${overlayToDelete._id}`)
      .then(() => {
        setOverlays(overlays.filter((_, i) => i !== index));
      })
      .catch(console.error);
  };

  const handleUpdateOverlay = (index, updates) => {
    const updated = [...overlays];
    updated[index] = { ...updated[index], ...updates };
    setOverlays(updated);

    axios
      .put(
        `http://localhost:5000/api/overlays/${updated[index]._id}`,
        updated[index]
      )
      .catch(console.error);
  };

  return (
    <div className="app">
      <div className="stream-controls">
        <input
          type="text"
          placeholder="Enter RTSP URL"
          value={rtspInput}
          onChange={(e) => setRtspInput(e.target.value)}
        />
        <button onClick={startStream}>Start Stream</button>
      </div>

      <div className="stream-status">
        Status: <span className={streamStatus}>{streamStatus}</span>
      </div>

      <div className="content">
        <div className="video-container">
          {streamUrl && <VideoPlayer streamUrl={streamUrl} />}
          {overlays.map((overlay, index) => (
            <div
              key={index}
              className="overlay"
              style={{
                position: "absolute",
                left: overlay.position.x,
                top: overlay.position.y,
                width: overlay.size.width,
                height: overlay.size.height,
              }}
            >
              {overlay.type === "text" ? (
                <span>{overlay.content}</span>
              ) : (
                <img src={overlay.content} alt="overlay" />
              )}
            </div>
          ))}
        </div>

        <OverlayEditor
          overlays={overlays}
          onAddOverlay={handleAddOverlay}
          onUpdateOverlay={handleUpdateOverlay}
          onDeleteOverlay={handleDeleteOverlay}
        />
      </div>
    </div>
  );
}

export default App;
