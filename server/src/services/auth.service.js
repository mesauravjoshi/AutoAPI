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
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
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
  // console.log(user);

  if (!user) {
    throw { status: 401, message: "Invalid email or password." };
  }

  // Can this account actually log in with a password?
  const hasUsablePassword =
    user.password && (user.provider === "local" || user.hasLocalPassword === true);
  // console.log(hasUsablePassword);

  if (!hasUsablePassword) {
    throw {
      status: 409,
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
      firstname: user.firstname,
      lastname: user.lastname,
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
    // const hashedPassword = await bcrypt.hash(randomPassword, 10);
    const username = email.split('@')[0] + Math.floor(Math.random() * 10000);

    user = await User.create({
      username,
      email,
      firstname,
      lastname,
      password: null,
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

// ─── Profile Services ─────────────────────────────────────────────────────────

/**
 * Returns whether the user has a real (manually set) password.
 * Google-only users have a random hashed password but provider = "google",
 * so we surface hasPassword = false for them unless they've created one.
 */
export const getPasswordStatus = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw { status: 404, message: "User not found." };

  // A user "has a password" only when provider is local OR they have
  // explicitly created a password after OAuth signup.
  const hasPassword = user.provider === "local" || user.hasLocalPassword === true;
  return { hasPassword };
};

/**
 * Creates a password for a Google-only account (no existing local password).
 */
export const createPassword = async (userId, { newPassword, confirmPassword }) => {
  if (!newPassword || !confirmPassword) {
    throw { status: 400, message: "All fields are required." };
  }
  if (newPassword !== confirmPassword) {
    throw { status: 400, message: "Passwords do not match." };
  }
  if (newPassword.length < 8) {
    throw { status: 400, message: "Password must be at least 8 characters." };
  }

  const user = await User.findById(userId);
  if (!user) throw { status: 404, message: "User not found." };

  // Block if a password already exists — local signup OR previously-created local password
  if (user.provider === "local" || user.hasLocalPassword) {
    throw {
      status: 409,
      message: "Account already has a password. Use Change Password instead.",
    };
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  user.password = hashed;
  user.hasLocalPassword = true;
  await user.save();

  return { message: "Password created successfully." };
};

/**
 * Changes password for a user who already has a local password.
 */
export const changePassword = async (userId, { currentPassword, newPassword, confirmPassword }) => {
  if (!currentPassword || !newPassword || !confirmPassword) {
    throw { status: 400, message: "All fields are required." };
  }
  if (newPassword !== confirmPassword) {
    throw { status: 400, message: "New passwords do not match." };
  }
  if (newPassword.length < 8) {
    throw { status: 400, message: "Password must be at least 8 characters." };
  }

  const user = await User.findById(userId);
  if (!user) throw { status: 404, message: "User not found." };

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw { status: 401, message: "Current password is incorrect." };
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  user.password = hashed;
  await user.save();

  return { message: "Password changed successfully." };
};

/**
 * Updates firstname, lastname, and/or username. fullname is auto-computed by the pre-save hook.
 */
export const updateProfile = async (userId, { firstname, lastname, username }) => {
  if (!firstname && !lastname && !username) {
    throw { status: 400, message: "At least one field is required." };
  }

  const user = await User.findById(userId);
  if (!user) throw { status: 404, message: "User not found." };

  // Check username uniqueness if changing it
  if (username && username !== user.username) {
    const taken = await User.findOne({ username });
    if (taken) throw { status: 409, message: "Username is already taken." };
    user.username = username;
  }

  if (firstname !== undefined) user.firstname = firstname;
  if (lastname !== undefined) user.lastname = lastname;

  await user.save(); // triggers fullname pre-save hook

  return {
    message: "Profile updated successfully.",
    user: {
      id: user._id,
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      fullname: user.fullname,
      email: user.email,
      picture: user.picture || null,
      provider: user.provider,
    },
  };
};

/**
 * Updates the user's email. Requires password verification for security.
 */
export const updateEmail = async (userId, { newEmail, password }) => {
  if (!newEmail || !password) {
    throw { status: 400, message: "New email and current password are required." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(newEmail)) {
    throw { status: 400, message: "Invalid email address." };
  }

  const user = await User.findById(userId);
  if (!user) throw { status: 404, message: "User not found." };

  if (newEmail === user.email) {
    throw { status: 409, message: "New email is the same as the current email." };
  }

  // Verify identity via password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw { status: 401, message: "Password is incorrect." };
  }

  // Check new email isn't taken
  const emailTaken = await User.findOne({ email: newEmail });
  if (emailTaken) throw { status: 409, message: "Email is already in use." };

  user.email = newEmail;
  await user.save();

  return {
    message: "Email updated successfully.",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      picture: user.picture || null,
      provider: user.provider,
    },
  };
};