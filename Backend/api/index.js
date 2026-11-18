// Vercel serverless entry: reuses one Mongo connection across warm invocations.
import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import app from "../src/app.js";
import connectToDb from "../src/config/db.js";

let ready;
export default async function handler(req, res) {
  ready ??= connectToDb();
  await ready;
  return app(req, res);
}
