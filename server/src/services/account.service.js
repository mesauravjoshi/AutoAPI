import User from "#models/user.js";
import Workspace from "#models/workspace.js";
import Membership from "#models/membership.js";
import Collection from "#models/collection.js";
import Request from "#models/request.js";
import RequestHistory from "#models/history.js";
import Token from "#models/token.js";
import Tab from "#models/tab.js";

/**
 * Permanently delete an account and cascade delete all user-related data.
 *
 * Cascading deletion scope:
 * 1. User document
 * 2. Memberships (in user's owned workspaces, and user's memberships across all workspaces)
 * 3. Workspaces (workspaces owned by user; pulls user from other workspaces' member list)
 * 4. Collections (in user's owned workspaces and created by the user)
 * 5. Requests (all requests inside deleted collections)
 * 6. RequestHistory (all history logged by the user)
 * 7. Tabs and Tokens (tokens and open tabs belonging to the user)
 *
 * @param {Object} params
 * @param {string} params.userId - Authenticated user ID
 * @param {string} params.email - Confirmation email provided by the user
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export const deleteAccount = async ({ userId, email }) => {
  if (!email || typeof email !== "string" || !email.trim()) {
    const error = new Error("Email confirmation is required.");
    error.status = 400;
    throw error;
  }

  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found.");
    error.status = 404;
    throw error;
  }

  // Verify that the confirmation email matches the user's account email
  if (user.email.toLowerCase().trim() !== email.toLowerCase().trim()) {
    const error = new Error("Provided email does not match your account email.");
    error.status = 400;
    throw error;
  }

  const userObjId = user._id;

  // 1. Identify all workspaces owned by the user
  const ownedWorkspaces = await Workspace.find({ ownerId: userObjId }).select("_id").lean();
  const ownedWorkspaceIds = ownedWorkspaces.map((w) => w._id);

  // 2. Identify all collections in owned workspaces or created by this user
  const collectionsToDelete = await Collection.find({
    $or: [
      { workspaceId: { $in: ownedWorkspaceIds } },
      { createdBy: userObjId },
    ],
  }).select("_id").lean();
  const collectionIds = collectionsToDelete.map((c) => c._id);

  // 3. Delete all requests belonging to those collections
  if (collectionIds.length > 0) {
    await Request.deleteMany({ collectionId: { $in: collectionIds } });
  }

  // 4. Delete the collections
  if (collectionIds.length > 0) {
    await Collection.deleteMany({ _id: { $in: collectionIds } });
  }

  // 5. Delete memberships:
  //    - Memberships inside owned workspaces
  //    - The user's memberships in any workspace (by userId or email)
  await Membership.deleteMany({
    $or: [
      { workspaceId: { $in: ownedWorkspaceIds } },
      { userId: userObjId },
      { email: user.email.toLowerCase().trim() },
    ],
  });

  // 6. Pull the user from members list in any remaining shared workspaces
  await Workspace.updateMany(
    { members: userObjId },
    { $pull: { members: userObjId } }
  );

  // 7. Delete owned workspaces
  if (ownedWorkspaceIds.length > 0) {
    await Workspace.deleteMany({ _id: { $in: ownedWorkspaceIds } });
  }

  // 8. Delete request history
  await RequestHistory.deleteMany({ userId: userObjId });

  // 9. Delete tabs and tokens
  await Tab.deleteMany({ userId: userObjId });
  await Token.deleteMany({ userId: userObjId });

  // 10. Delete the user document
  await User.findByIdAndDelete(userObjId);

  return {
    success: true,
    message: "Account and all associated data deleted successfully.",
  };
};
