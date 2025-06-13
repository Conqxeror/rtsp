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