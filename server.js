import express from "express";
import { WebSocketServer } from "ws";
import cors from "cors";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Mock DMX state
let dmxState = {
  channels: Array(512).fill(0),
  rgb: { r: 0, g: 0, b: 0 },
  connected: false,
};

// Routes
app.get("/metrics", (req, res) => {
  res.json({
    status: "online",
    channels: dmxState.channels.filter((v) => v > 0).length,
    timestamp: Date.now(),
  });
});

app.get("/rgb", (req, res) => {
  res.json(dmxState.rgb);
});

app.post("/rgb", (req, res) => {
  dmxState.rgb = { ...dmxState.rgb, ...req.body };
  res.json({ success: true, rgb: dmxState.rgb });
});

app.post("/command", (req, res) => {
  console.log("Command received:", req.body);
  res.json({ success: true, command: req.body });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`✨ DMX Backend server running on http://localhost:${PORT}`);
});

// WebSocket server
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("WebSocket client connected");

  ws.on("message", (message) => {
    console.log("Received:", message.toString());
    ws.send(JSON.stringify({ echo: message.toString() }));
  });

  ws.on("close", () => {
    console.log("WebSocket client disconnected");
  });
});

// Graceful shutdown
process.on("SIGTERM", () => {
  server.close(() => {
    console.log("Server closed");
  });
});
