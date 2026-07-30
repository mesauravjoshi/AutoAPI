import jwt from 'jsonwebtoken';
import User from "#models/user.js";

export const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      message: 'Not authorized',
    });
  }

  try {
    // Verify the access token (stateless — no DB lookup needed)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: 'User not found',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token expired',
        expired: true,
      });
    }

    return res.status(401).json({
      message: 'Invalid token',
    });
  }
};