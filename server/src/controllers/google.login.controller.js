import { OAuth2Client } from "google-auth-library";
import dotenv from 'dotenv';
import * as authService from "#services/auth.service.js";
dotenv.config();

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "postmessage" // important
);

export const googleLogin = async (req, res) => {
  try {
    const { code } = req.body;

    const { tokens } = await client.getToken(code);

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const result = await authService.googleLogin(payload);

    // Set refresh token in httpOnly cookie (same as regular login)
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      success: true,
      message: "Google login successful",
      user: result.user,
      workspace: result.workspace,
      token: result.accessToken,
    });

  } catch (error) {
    console.error(error);
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};