import userModel from "../model/user.model.js";
import jwt from "jsonwebtoken";

const publicUser = (u) => ({ id: u._id, username: u.username, email: u.email });

const accessToken = (user) =>
  jwt.sign({ id: user._id, purpose: "access" }, process.env.JWT_SECRET, { expiresIn: "30d" });

export async function register(req, res) {
  const username = String(req.body.username || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Username, email and password are required" });
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ message: "Please enter a valid email address" });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  const exists = await userModel.findOne({ $or: [{ username }, { email }] });
  if (exists) {
    return res.status(409).json({ message: "User already exists with this username or email" });
  }

  const user = await userModel.create({ username, email, password });
  res.status(201).json({ success: true, token: accessToken(user), user: publicUser(user) });
}

export async function login(req, res) {
  const identifier = String(req.body.email || req.body.username || "").trim();
  const password = String(req.body.password || "");
  if (!identifier || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await userModel.findOne({
    $or: [{ email: identifier.toLowerCase() }, { username: identifier }],
  });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Incorrect email or password" });
  }

  res.json({ success: true, token: accessToken(user), user: publicUser(user) });
}

export async function me(req, res) {
  res.json({ user: publicUser(req.user) });
}
