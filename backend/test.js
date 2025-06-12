const request = require("supertest");
const app = require("./server");
const mongoose = require("mongoose");
const fs = require("fs");

const { stopAllStreams } = require("./controllers/streamController");

describe("API Tests", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
  });

  afterAll(() => {
    if (fs.existsSync("./test_streams")) {
      fs.rmSync("./test_streams", { recursive: true });
    }
  });

  let overlayId;

  test("Create Overlay", async () => {
    const res = await request(app)
      .post("/api/overlays")
      .send({
        type: "text",
        content: "Test",
        position: { x: 0, y: 0 },
      });
    expect(res.statusCode).toEqual(201);
    overlayId = res.body._id;
  });

  test("Start Stream", async () => {
    const res = await request(app).post("/api/stream/start").send({
      rtspUrl:
        "rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mp4",
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("streamUrl");
  });
});
