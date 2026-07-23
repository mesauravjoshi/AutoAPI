import { OAuth2Client } from "google-auth-library";
import dotenv from 'dotenv';
dotenv.config();

// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
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

    console.log(payload);

    res.json({
      success: true,
      user: payload,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};