import { WebSocketServer } from "ws";

const PORT = parseInt(process.env.WS_PORT ?? "8080", 10);
const clients = new Set();

export const wss = new WebSocketServer({ port: PORT });

wss.on("connection", (ws, req) => {
  clients.add(ws);
  console.log(`[WS] Client connected. Total: ${clients.size}`);

  // Send a welcome/handshake immediately
  ws.send(JSON.stringify({ type: "CONNECTED", timestamp: Date.now() }));

  ws.on("close", () => {
    clients.delete(ws);
    console.log(`[WS] Client disconnected. Total: ${clients.size}`);
  });

  ws.on("error", (err) => {
    console.error("[WS] Client error:", err.message);
    clients.delete(ws);
  });
});

wss.on("error", (err) => {
  console.error("[WS] Server error:", err.message);
});

export function broadcast(data) {
  const msg = JSON.stringify(data);
  for (const client of clients) {
    if (client.readyState === 1 /* OPEN */) {
      client.send(msg);
    }
  }
}

console.log(`[WS] WebSocket server started on ws://localhost:${PORT}`);
