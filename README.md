# 📘 Project Documentation: RTSP Livestream App with Overlay Editor

---

## 🧠 Overview

This project is a **web application** that allows users to stream RTSP video, add **live overlays (text/images)**, and control the position, size, and styling of those overlays. The backend uses **Node.js** (temporarily), but according to assignment requirements, it should ideally be reimplemented in **Python (Flask)**.

---

## 🚀 Features

* Stream video from any public **RTSP URL**.
* Add overlays on the video in **real time** (text or image).
* Drag and resize overlays within the video container.
* Save overlays via backend API (MongoDB).
* Perform full **CRUD** operations on overlays.
* Live feedback and controls (pause, play, volume).

---

## 🧩 Technology Stack

| Layer     | Stack                      |
| --------- | -------------------------- |
| Frontend  | React, Video.js, Axios     |
| Backend   | Node.js (Express) \[TEMP]  |
| Database  | MongoDB                    |
| Streaming | FFmpeg (via fluent-ffmpeg) |

Assignment mentions **Python (Flask)** as the preferred backend.

---

# 📟 API Documentation (CRUD + Stream)

### 🌐 Base URL:

```
http://localhost:5000/api
```

## 📍 Overlay Endpoints

### ➕ POST `/overlays`

Create a new overlay.

**Request Body**:

```json
{
  "type": "text", // or "image"
  "content": "Hello World",
  "position": { "x": 100, "y": 150 },
  "size": { "width": 200, "height": 100 },
  "color": "#ffffff",
  "fontSize": "18px",
  "bgColor": "#00000080"
}
```

**Response**: `201 Created`

```json
{
  "_id": "...",
  "type": "text",
  "...": "..."
}
```

---

### 📥 GET `/overlays`

Returns all saved overlays.

**Response**:

```json
[
  { "_id": "...", "type": "text", ... },
  { "_id": "...", "type": "image", ... }
]
```

---

### ♻️ PUT `/overlays/:id`

Update an existing overlay.

**Request Body** (partial updates allowed):

```json
{
  "position": { "x": 200, "y": 250 }
}
```

**Response**: `200 OK`

---

### ❌ DELETE `/overlays/:id`

Delete an overlay.

**Response**:

```json
{
  "message": "Overlay deleted"
}
```

---

## 📡 Stream Endpoints

### ▶️ POST `/stream/start`

Starts a stream from a given RTSP URL.

**Request Body**:

```json
{
  "rtspUrl": "rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mp4"
}
```

**Response**:

```json
{
  "streamId": "168234234",
  "streamUrl": "/streams/168234234/index.m3u8"
}
```

---

### ℹ️ GET `/stream/status/:streamId`

Returns status of the stream.

### ⏹️ POST `/stream/stop/:streamId`

Stops a running stream.

---

# 👨‍🏫 User Documentation

## 🔧 Installation

### 🖥️ Backend Setup

```bash
cd backend
npm install
cp .env.example .env # Add your MongoDB URI
npm start
```

### 💻 Frontend Setup

```bash
cd frontend
npm install
npm start
```

> Open `http://localhost:3000`

---

## 📽️ How to Use

### 1. Enter RTSP URL

Paste a valid RTSP URL into the input box and click **Start Stream**.

### 2. Add Overlay

* Type the text or image URL.
* Set font size, colors.
* Click **Add Overlay**.

### 3. Edit Overlay

* Double-click overlay to edit content.
* Resize by dragging edges.
* Move by dragging overlay.
* Delete with the ❌ button.

---
