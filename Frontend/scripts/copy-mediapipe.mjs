// Copies the MediaPipe WASM runtime out of node_modules so the app serves it
// itself (no third-party CDN at runtime -> works offline + more private).
import { cpSync, mkdirSync, existsSync } from "node:fs";

const from = "node_modules/@mediapipe/tasks-vision/wasm";
const to = "public/mediapipe/wasm";
if (!existsSync(from)) {
  console.error("Run `npm install` first.");
  process.exit(1);
}
mkdirSync(to, { recursive: true });
cpSync(from, to, { recursive: true });
console.log("MediaPipe WASM copied to", to);
