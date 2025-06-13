// frontend/src/components/OverlayEditor.js
import React, { useState, useRef, useEffect } from "react";
import Draggable from "react-draggable";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";

const OverlayItem = ({ overlay, onUpdate, onDelete, index, boundsRef }) => {
  const nodeRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(overlay.content);

  const handleSave = () => {
    onUpdate(index, { content: editContent });
    setIsEditing(false);
  };

  // State to hold calculated max constraints for resizing
  const [maxConstraints, setMaxConstraints] = useState([Infinity, Infinity]);

  useEffect(() => {
    const updateMaxConstraints = () => {
      if (boundsRef.current && overlay.position) {
        const parent = boundsRef.current.getBoundingClientRect();
        const maxWidth = parent.width - overlay.position.x;
        const maxHeight = parent.height - overlay.position.y;
        setMaxConstraints([maxWidth, maxHeight]);
      }
    };

    updateMaxConstraints();
    window.addEventListener("resize", updateMaxConstraints);
    return () => window.removeEventListener("resize", updateMaxConstraints);
  }, [boundsRef, overlay.position]);

  return (
    <Draggable
      nodeRef={nodeRef}
      position={overlay.position}
      onStop={(e, data) => {
        const parent = boundsRef.current?.getBoundingClientRect();
        if (!parent) return;

        const width = overlay.size.width;
        const height = overlay.size.height;
        const maxX = parent.width - width;
        const maxY = parent.height - height;

        const x = Math.max(0, Math.min(data.x, maxX));
        const y = Math.max(0, Math.min(data.y, maxY));

        onUpdate(index, { position: { x, y } });
      }}
      bounds={boundsRef.current} // Use the ref directly as bounds
      cancel=".react-resizable-handle"
    >
      <div
        ref={nodeRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 2,
        }}
      >
        <ResizableBox
          width={overlay.size.width}
          height={overlay.size.height}
          minConstraints={[50, 30]}
          maxConstraints={maxConstraints} // Use dynamic maxConstraints
          onResizeStop={(e, { size }) => {
            onUpdate(index, {
              size: { width: size.width, height: size.height },
            });
          }}
        >
          <div
            className="overlay-item"
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: overlay.bgColor || "transparent",
              color: overlay.color || "#fff",
              fontSize: overlay.fontSize || "16px",
              border: "1px dashed #ccc",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              cursor: "move",
              userSelect: "none",
            }}
          >
            {isEditing ? (
              <div className="edit-controls">
                <input
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  autoFocus
                />
                <button onClick={handleSave}>✓</button>
              </div>
            ) : (
              <div
                onDoubleClick={() => setIsEditing(true)}
                style={{ width: "100%", height: "100%", textAlign: "center" }}
              >
                {overlay.type === "text" ? (
                  <span>{overlay.content}</span>
                ) : (
                  <img
                    src={overlay.content}
                    alt="overlay"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                )}
              </div>
            )}

            <button
              onClick={() => onDelete(index)}
              className="delete-btn"
              style={{
                position: "absolute",
                top: "-10px",
                right: "-10px",
                background: "#ff4444",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                width: "20px",
                height: "20px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              ×
            </button>
          </div>
        </ResizableBox>
      </div>
    </Draggable>
  );
};

const OverlayEditor = ({
  overlays,
  onAddOverlay,
  onUpdateOverlay,
  onDelete,
  boundsRef, // Receive boundsRef from parent (VideoPlayer)
}) => {
  const [newOverlay, setNewOverlay] = useState({
    type: "text",
    content: "",
    position: { x: 50, y: 50 }, // will be adjusted on mount
    size: { width: 150, height: 80 },
    color: "#ffffff",
    fontSize: "16px",
    bgColor: "#00000080",
  });

  const handleAdd = () => {
    if (!newOverlay.content.trim()) return;

    const bounds = boundsRef.current?.getBoundingClientRect();
    const defaultX = bounds
      ? bounds.width / 2 - newOverlay.size.width / 2
      : 100;
    const defaultY = bounds
      ? bounds.height / 2 - newOverlay.size.height / 2
      : 100;

    const overlayWithPosition = {
      ...newOverlay,
      position: { x: defaultX, y: defaultY },
    };

    onAddOverlay(overlayWithPosition);

    setNewOverlay({
      ...newOverlay,
      content: "",
    });
  };

  return (
    <>
      {/* Input controls moved to App.js, but keeping them here for demonstration
          if you prefer to manage new overlay input directly within editor for now.
          For this solution, App.js will handle the adding.
      */}
      <div
        className="overlay-controls"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          marginBottom: "20px",
          position: "absolute", // Make this absolute within its container
          top: "10px", // Adjust positioning as needed
          left: "10px",
          zIndex: 20, // Ensure it's above overlays if desired
          background: "rgba(255, 255, 255, 0.8)", // Semi-transparent background
          padding: "10px",
          borderRadius: "8px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
        }}
      >
        <select
          value={newOverlay.type}
          onChange={(e) =>
            setNewOverlay({ ...newOverlay, type: e.target.value })
          }
        >
          <option value="text">Text</option>
          <option value="image">Image</option>
        </select>

        <input
          type="text"
          placeholder={newOverlay.type === "text" ? "Enter text" : "Image URL"}
          value={newOverlay.content}
          onChange={(e) =>
            setNewOverlay({ ...newOverlay, content: e.target.value })
          }
        />

        <input
          type="color"
          value={newOverlay.color}
          onChange={(e) =>
            setNewOverlay({ ...newOverlay, color: e.target.value })
          }
        />

        <input
          type="range"
          min="12"
          max="72"
          value={parseInt(newOverlay.fontSize, 10)}
          onChange={(e) =>
            setNewOverlay({ ...newOverlay, fontSize: `${e.target.value}px` })
          }
        />

        <input
          type="color"
          value={newOverlay.bgColor}
          onChange={(e) =>
            setNewOverlay({ ...newOverlay, bgColor: e.target.value })
          }
        />

        <button onClick={handleAdd}>Add Overlay</button>
      </div>

      {/* Overlay canvas will now be implicitly the parent element where OverlayEditor is rendered */}
      {overlays.map((overlay, index) => (
        <OverlayItem
          key={overlay._id || index}
          overlay={overlay}
          onUpdate={onUpdateOverlay}
          onDelete={onDelete}
          index={index}
          boundsRef={boundsRef} // Pass the received boundsRef to individual OverlayItems
        />
      ))}
    </>
  );
};

export default OverlayEditor;
