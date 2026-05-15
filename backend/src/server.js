/**
 * server.js — application entry point.
 *
 * Sets up:
 *  • Express with JSON body parsing, CORS, session middleware
 *  • Socket.io attached to the same HTTP server
 *  • Prisma DB client
 *  • Static file serving (React build) in production
 */

import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import session from "express-session";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import routes from "./routes/index.js";
import { initSocket } from "./socket/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

const app = express();
const httpServer = createServer(app);

// ── Socket.io ────────────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: { origin: CLIENT_ORIGIN, credentials: true },
});
initSocket(io);

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: true,   // creates session immediately (needed for vote tracking)
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",  // HTTPS only in prod
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // cross-origin in prod
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// Attach io to every request so controllers can emit events without importing io directly
app.use((req, _res, next) => {
  req.getIO = () => io;
  next();
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api", routes);

// Static serving only in local dev (not needed in Docker — Nginx handles it)
if (process.env.NODE_ENV !== "production") {
  const distPath = path.join(__dirname, "../../frontend/dist");
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// ── Start ─────────────────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`🚀  Server running on http://localhost:${PORT}`);
});