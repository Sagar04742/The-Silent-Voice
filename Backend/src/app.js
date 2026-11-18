import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import authRouter from "./routes/user.routes.js";
import historyRouter from "./routes/history.routes.js";

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(helmet({ contentSecurityPolicy: false }));
// Allow the configured front-end origins, plus same-origin requests (when Express serves the build).
app.use(
  cors((req, cb) => {
    const origin = req.headers.origin;
    const sameOrigin = origin && origin === `${req.protocol}://${req.get("host")}`;
    cb(null, { origin: !origin || sameOrigin || allowedOrigins.includes(origin) });
  }),
);
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, db: mongoose.connection.readyState === 1 });
});

// Brute-force protection on login / register.
app.use(
  "/api/auth",
  rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: true, legacyHeaders: false }),
  authRouter,
);
app.use("/api/history", historyRouter);

// Optional: serve the built React app from the same server (single-host deploy).
const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../Frontend/dist");
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^\/(?!api\/).*/, (req, res) => res.sendFile(path.join(dist, "index.html")));
}

app.use("/api", (req, res) => res.status(404).json({ message: "Not found" }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Something went wrong" });
});

export default app;
