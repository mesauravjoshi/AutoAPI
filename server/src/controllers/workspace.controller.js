import Workspace from "#models/workspace.js";
import Membership from "#models/membership.js";

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