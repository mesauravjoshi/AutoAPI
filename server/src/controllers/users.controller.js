import mongoose from "mongoose";
import User from "#models/user.js";

export const getUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    // console.log('user Id ', userId);

    const users = await User.find({
      _id: { $ne: userId } // exclude current user (optional)
    }).lean();

    const usersWithStatus = users.map(user => ({
      ...user,
      status: "online"
    }));

    res.status(200).json({
      success: true,
      users: usersWithStatus
    });
  } catch (error) {
    console.error("Error fetching users:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch users"
    });
  }
};