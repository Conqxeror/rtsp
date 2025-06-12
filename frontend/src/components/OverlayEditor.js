import React, { useState, useRef } from "react";
import Draggable from "react-draggable";
import { Resizable } from "react-resizable";
import "react-resizable/css/styles.css";

const OverlayItem = ({ overlay, onUpdate, onDelete, index }) => {
  const nodeRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(overlay.content);

  const handleSave = () => {
    onUpdate(index, { content: editContent });
    setIsEditing(false);
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      position={overlay.position}
      onStop={(e, data) =>
        onUpdate(index, { position: { x: data.x, y: data.y } })
      }
    >
      <Resizable
        width={overlay.size.width}
        height={overlay.size.height}
        onResize={(e, { size }) => onUpdate(index, { size })}
      >
        <div
          ref={nodeRef}
          className="overlay-item"
          style={{
            width: overlay.size.width,
            height: overlay.size.height,
            color: overlay.color || "#ffffff",
            fontSize: overlay.fontSize || "16px",
            backgroundColor: overlay.bgColor || "transparent",
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
              className="content-wrapper"
              onDoubleClick={() => setIsEditing(true)}
            >
              {overlay.type === "text" ? (
                <span>{overlay.content}</span>
              ) : (
                <img src={overlay.content} alt="overlay" />
              )}
            </div>
          )}
          <button className="delete-btn" onClick={() => onDelete(index)}>
            ×
          </button>
        </div>
      </Resizable>
    </Draggable>
  );
};

const OverlayEditor = ({ overlays, onAddOverlay, onUpdateOverlay }) => {
  const [newOverlay, setNewOverlay] = useState({
    type: "text",
    content: "",
    position: { x: 0, y: 0 },
    size: { width: 100, height: 50 },
  });

  const handleAdd = () => {
    if (!newOverlay.content.trim()) return;
    onAddOverlay(newOverlay);
    setNewOverlay({ ...newOverlay, content: "" });
  };

  return (
    <div className="overlay-editor">
      <div className="style-controls">
        {newOverlay.type === "text" && (
          <>
            <input
              type="color"
              value={newOverlay.color || "#ffffff"}
              onChange={(e) =>
                setNewOverlay({ ...newOverlay, color: e.target.value })
              }
            />
            <input
              type="range"
              min="12"
              max="72"
              value={newOverlay.fontSize || "16"}
              onChange={(e) =>
                setNewOverlay({
                  ...newOverlay,
                  fontSize: `${e.target.value}px`,
                })
              }
            />
          </>
        )}
        <input
          type="color"
          value={newOverlay.bgColor || "#00000000"}
          onChange={(e) =>
            setNewOverlay({ ...newOverlay, bgColor: e.target.value })
          }
        />
      </div>
      <div className="controls">
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

        <button onClick={handleAdd}>Add Overlay</button>
      </div>

      <div
        className="preview-area"
        style={{ position: "relative", height: "400px" }}
      >
        {overlays.map((overlay, index) => (
          <OverlayItem
            key={overlay._id || index}
            overlay={overlay}
            onUpdate={onUpdateOverlay}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

export default OverlayEditor;
