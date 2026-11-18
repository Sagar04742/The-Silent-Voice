import jwt from "jsonwebtoken";
import userModel from "../model/user.model.js";

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Please log in" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.purpose !== "access") throw new Error("bad token");
    const user = await userModel.findById(payload.id);
    if (!user) return res.status(401).json({ message: "Account not found" });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Session expired, please log in again" });
  }
}
