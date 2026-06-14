// services/auth.service.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "#models/user.js";
import Token from "#models/token.js";
import Workspace from "#models/workspace.js";

export const signup = async ({ username, email, password, firstname, lastname }) => {
  if (!username || !email || !password || !firstname) {
    throw { status: 400, message: "All fields required!" };
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    throw { status: 409, message: "User already exists." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    username,
    email,
    firstname,
    lastname,
    password: hashedPassword,
  });

  await Workspace.create({
    name: `${firstname}'s Workspace`,
    ownerId: newUser._id,
    members: [newUser._id],
  });

  return { message: "User created successfully." };
};

export const login = async ({ email, password }) => {
  
  if (!email || !password) {
    throw { status: 400, message: "Email and password required." };
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw { status: 409, message: "Invalid email or password." };
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw { status: 422 , message: "Invalid email or password." };
  }

  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );

  await Token.create({
    userId: user._id,
    token,
    type: "refresh",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  // Find user's workspace
  const workspace = await Workspace.findOne({
    ownerId: user._id,
  });

  return {
    message: "Login successful",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
    token,
    workspace
  };
};

export const logout = async (token) => {
  await Token.findOneAndDelete({ token });
};