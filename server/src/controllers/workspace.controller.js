import mongoose from "mongoose";
import Workspace from "#models/workspace.js";
import Membership from "#models/membership.js";
import Collection from "#models/collection.js";
import Request from "#models/request.js";

// const WORKSPACE_TYPES = ["personal", "internal", "partner", "public"];

export const getWorkspace = async (req, res) => {
  try {
    const userId = req.user?.id;

    // Every workspace the user is an ACTIVE member of — owner or otherwise
    const memberships = await Membership.find({ userId, status: "active" })
      .populate({
        path: "workspaceId",
        populate: { path: "ownerId", select: "_id fullname" },
      })
      .lean();
    // console.log('memberships', memberships);

    const formattedWorkspaces = memberships
      .filter((m) => m.workspaceId) // guard against a dangling ref if a workspace was deleted
      .map((m) => {
        const workspace = m.workspaceId;
        return {
          ...workspace,
          owner: workspace.ownerId,
          ownerId: undefined,
          myRole: m.role, // useful for the client to know if this user can manage the team
        };
      });
    // console.log('formattedWorkspaces', formattedWorkspaces);

    return res.status(200).json({
      success: true,
      message: "Workspaces fetched successfully",
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
    const ownerId = req.user.id; // from auth middleware
    const workspace = await Workspace.create({ name, type, ownerId });

    await Membership.create({
      workspaceId: workspace._id,
      userId: ownerId,
      role: "owner",
      status: "active",
      invitedBy: ownerId,
      joinedAt: new Date(),
    });

    const populated = await workspace.populate("ownerId", "fullname email picture");

    return res.status(201).json({ success: true, data: populated });
  } catch (err) {
    console.log(err);

    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: "Workspace name already exists" });
    }
    return res.status(500).json({ success: false, message: "Failed to create workspace" });
  }
};

/**
 * DELETE /workspaces/:id
 * Delete workspace if user is owner, user has > 1 workspaces remaining,
 * and cascades deletion to memberships, collections, and requests.
 */
export const deleteWorkspace = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid workspace ID",
      });
    }

    const workspace = await Workspace.findById(id);
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found",
      });
    }

    // Verify user role is owner
    const membership = await Membership.findOne({
      workspaceId: id,
      userId,
      status: "active",
    });

    const isOwner =
      membership?.role === "owner" ||
      workspace.ownerId.toString() === userId.toString();

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: "Only the workspace owner can delete this workspace",
      });
    }

    // Prevent deletion if user has only one workspace remaining
    const userMemberships = await Membership.find({ userId, status: "active" })
      .select("workspaceId")
      .lean();
    const activeWorkspaceIds = userMemberships.map((m) => m.workspaceId);

    const workspaceCount = await Workspace.countDocuments({
      _id: { $in: activeWorkspaceIds },
    });

    if (workspaceCount <= 1) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your only remaining workspace. You must have at least one workspace.",
      });
    }

    // Delete associated collections and requests inside this workspace
    const collections = await Collection.find({ workspaceId: id })
      .select("_id")
      .lean();
    const collectionIds = collections.map((c) => c._id);

    if (collectionIds.length > 0) {
      await Request.deleteMany({ collectionId: { $in: collectionIds } });
      await Collection.deleteMany({ _id: { $in: collectionIds } });
    }

    // Delete all associated membership records
    await Membership.deleteMany({ workspaceId: id });

    // Delete workspace
    await Workspace.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Workspace and associated records deleted successfully",
      deletedId: id,
    });
  } catch (error) {
    console.error("Delete workspace error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
