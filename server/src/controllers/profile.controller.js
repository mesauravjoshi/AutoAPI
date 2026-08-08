// controllers/profile.controller.js
import {
  getPasswordStatus,
  createPassword,
  changePassword,
  updateProfile,
  updateEmail,
} from "#services/auth.service.js";

// GET /api/profile/password-status
export const passwordStatus = async (req, res) => {
  try {
    const result = await getPasswordStatus(req.user._id);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.status || 500).json({
      message: err.message || "Server error",
    });
  }
};

// POST /api/profile/create-password
export const createPasswordHandler = async (req, res) => {
  try {
    const result = await createPassword(req.user._id, req.body);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.status || 500).json({
      message: err.message || "Server error",
    });
  }
};

// PUT /api/profile/change-password
export const changePasswordHandler = async (req, res) => {
  try {
    const result = await changePassword(req.user._id, req.body);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.status || 500).json({
      message: err.message || "Server error",
    });
  }
};

// PUT /api/profile/update-profile
export const updateProfileHandler = async (req, res) => {
  try {
    const result = await updateProfile(req.user._id, req.body);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.status || 500).json({
      message: err.message || "Server error",
    });
  }
};

// PUT /api/profile/update-email
export const updateEmailHandler = async (req, res) => {
  try {
    const result = await updateEmail(req.user._id, req.body);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.status || 500).json({
      message: err.message || "Server error",
    });
  }
};
