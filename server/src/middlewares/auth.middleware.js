import jwt from 'jsonwebtoken';
import User from "#models/user.js";
import Token from "#models/token.js";

export const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      message: 'Not authorized',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: 'User no longer exists',
      });
    }

    const tokenExists = await Token.findOne({
      userId: decoded.id,
      token,
    });

    if (!tokenExists) {
      return res.status(401).json({
        message: 'Token revoked',
      });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid token',
    });
  }
};