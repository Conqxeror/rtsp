// frontend/src/App.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import VideoPlayer from "./components/VideoPlayer";
import "./App.css";

function App() {
  const [streamUrl, setStreamUrl] = useState("");
  const [overlays, setOverlays] = useState([]);
  const [rtspInput, setRtspInput] = useState("");
  const [streamStatus, setStreamStatus] = useState("idle"); // 'idle', 'loading', 'active', 'error'
  const [streamId, setStreamId] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  // Fetch saved overlays on mount
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/overlays")
      .then((res) => setOverlays(res.data))
      .catch((err) => {
        console.error("Error fetching overlays:", err);
      });
  }, []);

  const startStream = async () => {
    if (!rtspInput.trim()) {
      setStatusMessage("Please enter an RTSP URL");
      return;
    }

    setStreamStatus("loading");
    setStatusMessage("Starting stream conversion...");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/stream/start",
        {
          rtspUrl: rtspInput,
        }
      );

      console.log("Stream response:", response.data);

      setStreamUrl(`http://localhost:5000${response.data.streamUrl}`);
      setStreamId(response.data.streamId);
      setStreamStatus("active");
      setStatusMessage("Stream active");

      // Optional: Check stream status after a delay
      setTimeout(() => checkStreamStatus(response.data.streamId), 5000);
    } catch (err) {
      console.error("Stream error:", err);
      setStreamStatus("error");
      setStatusMessage(err.response?.data?.error || "Failed to start stream");
    }
  };

  const checkStreamStatus = async (id) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/stream/status/${id}`
      );
      console.log("Stream status:", response.data);
    } catch (err) {
      console.error("Error checking stream status:", err);
    }
  };

  const testStreamUrl = () => {
    if (streamUrl) {
      window.open(streamUrl, "_blank");
    }
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
      <h1>RTSP Stream Viewer</h1>

      <div className="stream-controls">
        <input
          type="text"
          placeholder="Enter RTSP URL"
          value={rtspInput}
          onChange={(e) => setRtspInput(e.target.value)}
          style={{ width: "500px" }}
        />
        <button onClick={startStream} disabled={streamStatus === "loading"}>
          {streamStatus === "loading" ? "Starting..." : "Start Stream"}
        </button>
        {streamUrl && (
          <button onClick={testStreamUrl} style={{ marginLeft: "10px" }}>
            Test Stream URL
          </button>
        )}
      </div>

      <div className="stream-status">
        <strong>Status:</strong>
        <span className={`status-${streamStatus}`}> {streamStatus}</span>
        {statusMessage && <span> - {statusMessage}</span>}
        {streamId && <span> (ID: {streamId})</span>}
      </div>

      {streamUrl && (
        <div className="stream-info">
          <p>
            <strong>Stream URL:</strong> {streamUrl}
          </p>
        </div>
      )}

      <div className="video-wrapper">
        <VideoPlayer
          streamUrl={streamUrl}
          overlays={overlays}
          onAddOverlay={handleAddOverlay}
          onUpdateOverlay={handleUpdateOverlay}
          onDelete={handleDeleteOverlay}
        />
      </div>
    </div>
  );
}

export default App;
