import mongoose from "mongoose";
import Workspace from "#models/workspace.js";

export const getWorkspace = async (req, res) => {
  try {
    // assuming ownerId comes from authenticated user
    const userId = req.user?.id;
    const workspace = await Workspace.find({
      ownerId: userId
    })

    return res.status(201).json({
      success: true,
      message: "Workspace find successfully",
      data: workspace,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const addWorkspace = async (req, res) => {
  try {
    const { name } = req.body;
    
    // assuming ownerId comes from authenticated user
    const ownerId = req.user?.id || req.body.ownerId;
    
    console.log(name, ownerId);
    if (!name || !ownerId) {
      return res.status(400).json({
        success: false,
        message: "Name and ownerId are required",
      });
    }

    // Convert to ObjectId
    const ownerObjectId = new mongoose.Types.ObjectId(ownerId);

    const workspace = new Workspace({
      name,
      ownerId: ownerObjectId,
      members: [ownerObjectId],
    });

    const savedWorkspace = await workspace.save();

    return res.status(201).json({
      success: true,
      message: "Workspace created successfully",
      data: savedWorkspace,
    });
  } catch (error) {
    // Handle duplicate workspace name per owner
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Workspace with this name already exists for this user",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};