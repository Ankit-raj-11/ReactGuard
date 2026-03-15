import "./wsServer.js"; // starts WS server on import
import { startReactivityStream } from "./reactivity.js";
import express from "express";
import { createServer } from "http";

const app = express();
app.use(express.json());

// CORS for dashboard dev server
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// Health check
app.get("/health", (_req, res) =>
  res.json({ status: "ok", service: "ReactGuard Monitor", timestamp: Date.now() })
);

// Expose contract addresses for the frontend to load
app.get("/addresses", (_req, res) => {
  try {
    const { readFileSync } = await import("fs");
    const addrs = JSON.parse(readFileSync("../contracts/deployed-addresses.json", "utf8"));
    res.json(addrs);
  } catch {
    res.status(503).json({ error: "Contracts not deployed yet" });
  }
});

const PORT = process.env.HTTP_PORT ?? 3001;
app.listen(PORT, () => {
  console.log(`[HTTP] REST API on http://localhost:${PORT}`);
});

// Start the Reactivity read-only stream
startReactivityStream().catch((err) => {
  console.error("Failed to start Reactivity stream:", err);
  process.exit(1);
});
