// services/auth.service.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "#models/user.js";
import Token from "#models/token.js";
import Workspace from "#models/workspace.js";

// ─── Helpers ────────────────────────────────────────────────────────────────

const generateAccessToken = (user) =>
  jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "5h" }
  );

const generateRefreshToken = (user) =>
  jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" }
  );

const saveRefreshToken = async (userId, token) => {
  await Token.create({
    userId,
    token,
    type: "refresh",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
};

// ─── Signup ──────────────────────────────────────────────────────────────────

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

// ─── Login ───────────────────────────────────────────────────────────────────

export const login = async ({ email, password }) => {
  if (!email || !password) {
    throw { status: 400, message: "Email and password required." };
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw { status: 401, message: "Invalid email or password." };
  }

  if (!user.password || user.provider === "google") {
    throw {
      status: 409, // or 400 — some teams use a dedicated code
      message: "This account uses Google Sign-In. Please continue with Google.",
      code: "OAUTH_ONLY_ACCOUNT",
    };
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw { status: 401, message: "Invalid email or password." };
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Remove any previous refresh tokens for this user (single-session)
  await Token.deleteMany({ userId: user._id, type: "refresh" });

  // Save the new refresh token
  await saveRefreshToken(user._id, refreshToken);

  const workspace = await Workspace.findOne({ ownerId: user._id });

  return {
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      picture: user.picture || null,
    },
    accessToken,
    refreshToken,
    workspace,
  };
};

// ─── Refresh Token ───────────────────────────────────────────────────────────

export const refreshToken = async (token) => {
  if (!token) {
    throw { status: 401, message: "Refresh token missing." };
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    throw { status: 401, message: "Invalid or expired refresh token." };
  }

  // Check token exists in DB
  const storedToken = await Token.findOne({
    userId: decoded.id,
    token,
    type: "refresh",
  });

  if (!storedToken) {
    throw { status: 401, message: "Refresh token revoked." };
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    throw { status: 401, message: "User not found." };
  }

  const newAccessToken = generateAccessToken(user);

  return { accessToken: newAccessToken };
};

// ─── Logout ──────────────────────────────────────────────────────────────────

export const logout = async (userId) => {
  // Delete all refresh tokens for this user
  await Token.deleteMany({ userId, type: "refresh" });
};

// ─── Google Login ─────────────────────────────────────────────────────────────

export const googleLogin = async (payload) => {
  const { email, sub: googleId, given_name: firstname, family_name: lastname, picture } = payload;

  if (!email) {
    throw { status: 400, message: "Email not provided by Google." };
  }

  let user = await User.findOne({ email });

  if (!user) {
    const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);
    const username = email.split('@')[0] + Math.floor(Math.random() * 10000);

    user = await User.create({
      username,
      email,
      firstname,
      lastname,
      password: hashedPassword,
      googleId,
      provider: "google",
      picture
    });

    await Workspace.create({
      name: `${firstname || username}'s Workspace`,
      ownerId: user._id,
      members: [user._id],
    });
  } else if (!user.googleId) {
    user.googleId = googleId;
    user.provider = "google";
    if (picture && !user.picture) {
      user.picture = picture;
    }
    await user.save();
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Remove previous refresh tokens and save new one
  await Token.deleteMany({ userId: user._id, type: "refresh" });
  await saveRefreshToken(user._id, refreshToken);

  const workspace = await Workspace.findOne({ ownerId: user._id });

  return {
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      picture: user.picture,
    },
    accessToken,
    refreshToken,
    workspace,
  };
};