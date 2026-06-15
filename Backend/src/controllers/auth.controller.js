import userModel from "../model/user.model.js";
import jwt from "jsonwebtoken";

export async function register(req, rres) {
  const { username, email, password } = req.body;

  const isUserExist = await userModel.findOne({
    username,
    email,
  });

  if (isUserExist) {
    return res.status(409).json({
      message: "User already exist with the Username or password",
    });
  }

  const user = await userModel.create({
    username,
    email,
    password,
  });

  const token = jwt.sign(
    {
      email: user.email,
    },
    process.env.JWT_SECRET
  );
}
