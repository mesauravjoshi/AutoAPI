import mongoose from "mongoose";
import Workspace from "#models/workspace.js";

const WORKSPACE_TYPES = ["personal", "internal", "partner", "public"];

export const getWorkspace = async (req, res) => {
  try {
    // assuming ownerId comes from authenticated user
    const userId = req.user?.id;
    const workspaces = await Workspace.find({
      ownerId: userId,
    })
      .populate({
        path: "ownerId",
        select: "_id fullname",
      })
      .lean();

    const formattedWorkspaces = workspaces.map((workspace) => ({
      ...workspace,
      owner: workspace.ownerId,
      ownerId: undefined,
    }));

    return res.status(201).json({
      success: true,
      message: "Workspace find successfully",
      data: formattedWorkspaces,
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
    const { name, type } = req.body;

    // assuming ownerId comes from authenticated user
    const ownerId = req.user?.id || req.body.ownerId;

    if (!name || !ownerId) {
      return res.status(400).json({
        success: false,
        message: "Name and ownerId are required",
      });
    }

    if (!type || !WORKSPACE_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Type is required and must be one of: ${WORKSPACE_TYPES.join(", ")}`,
      });
    }

    // Convert to ObjectId
    const ownerObjectId = new mongoose.Types.ObjectId(ownerId);

    // Personal workspaces are single-member by definition; other types
    // start with just the owner too — additional members are added later
    // from the Teams page, not at creation time.
    const workspace = new Workspace({
      name,
      type,
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
    // Handle duplicate workspace name per owner, and duplicate personal workspace
    if (error.code === 11000) {
      const isPersonalConflict =
        error.keyPattern && "type" in error.keyPattern;
      return res.status(400).json({
        success: false,
        message: isPersonalConflict
          ? "You already have a personal workspace"
          : "Workspace with this name already exists for this user",
      });
    }

    // Handle schema validation errors (e.g. invalid enum value)
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)
          .map((e) => e.message)
          .join(", "),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};