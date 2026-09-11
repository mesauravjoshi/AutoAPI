// import mongoose from "mongoose";
import Membership from "#models/membership.js";
import User from "#models/user.js";
import Workspace from "#models/workspace.js";

class TeamServiceError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

// ---- permission helper, reused by controller-level middleware ----
export async function getMembershipRole(workspaceId, userId) {

  const membership = await Membership.findOne({
    workspaceId,
    userId,
    status: "active",
  }).lean();

  return membership?.role ?? null;
}

// ---- reads ----
export async function listMembers(workspaceId) {
  return Membership.find({ workspaceId, status: "active" })
    .populate("userId", "fullname email picture")
    .sort({ role: 1, joinedAt: 1 })
    .lean();
}

export async function listInvites(workspaceId) {
  
  return Membership.find({ workspaceId, status: "invited" })
    .populate("userId", "fullname email picture")
    .populate("invitedBy", "fullname")
    .sort({ invitedAt: -1 })
    .lean();
}

export async function listRequests(workspaceId) {
  return Membership.find({ workspaceId, status: "requested" })
    .populate("userId", "fullname email picture")
    .sort({ createdAt: -1 })
    .lean();
}

// users you can invite: not already an active member / pending invite in this workspace
export async function searchInvitableUsers(workspaceId, query) {
  if (!query || query.trim().length < 2) return [];

  const existingMembershipUserIds = await Membership.find({
    workspaceId,
    status: { $in: ["active", "invited"] },
  }).distinct("userId");

  return User.find({
    _id: { $nin: existingMembershipUserIds },
    $or: [
      { fullname: { $regex: query, $options: "i" } },
      { email: { $regex: query, $options: "i" } },
      { username: { $regex: query, $options: "i" } },
    ],
  })
    .select("fullname email username picture")
    .limit(10)
    .lean();
}

// ---- writes ----
export async function inviteMember({ workspaceId, email, userId, role, invitedBy }) {
  const workspace = await Workspace.findById(workspaceId).lean();
  if (!workspace) throw new TeamServiceError("Workspace not found", 404);
  if (workspace.type === "personal") {
    throw new TeamServiceError("Personal workspaces can't have members", 400);
  }

  const normalizedEmail = email?.toLowerCase().trim();
  const existingUser = userId
    ? await User.findById(userId).lean()
    : normalizedEmail
      ? await User.findOne({ email: normalizedEmail }).lean()
      : null;

  const filter = existingUser
    ? { workspaceId, userId: existingUser._id }
    : { workspaceId, email: normalizedEmail };

  const existing = await Membership.findOne(filter);
  if (existing) {
    if (existing.status === "active") throw new TeamServiceError("User is already a member", 409);
    if (existing.status === "invited") throw new TeamServiceError("User already has a pending invite", 409);
  }

  const membership = existing
    ? Object.assign(existing, { role, status: "invited", invitedBy, invitedAt: new Date() })
    : new Membership({
      workspaceId,
      userId: existingUser?._id,
      email: existingUser ? undefined : normalizedEmail,
      role,
      status: "invited",
      invitedBy,
    });

  await membership.save();

  return membership.populate("userId", "fullname email picture");
}

export async function requestToJoin({ workspaceId, userId }) {
  const workspace = await Workspace.findById(workspaceId).lean();
  if (!workspace) throw new TeamServiceError("Workspace not found", 404);
  if (workspace.type !== "public") {
    throw new TeamServiceError("Only public workspaces accept join requests", 400);
  }

  const existing = await Membership.findOne({ workspaceId, userId });
  if (existing) throw new TeamServiceError(`Already ${existing.status} for this workspace`, 409);

  return Membership.create({ workspaceId, userId, role: "viewer", status: "requested" });
}

export async function respondToRequest(membershipId, { approve }) {
  const membership = await Membership.findById(membershipId);
  if (!membership || membership.status !== "requested") {
    throw new TeamServiceError("Request not found", 404);
  }
  membership.status = approve ? "active" : "rejected";
  if (approve) membership.joinedAt = new Date();
  await membership.save();
  return membership;
}

export async function acceptInvite(membershipId, userId) {
  const membership = await Membership.findById(membershipId);
  if (!membership || membership.status !== "invited") {
    throw new TeamServiceError("Invite not found", 404);
  }
  membership.status = "active";
  membership.userId = membership.userId ?? userId;
  membership.joinedAt = new Date();
  await membership.save();
  return membership;
}

export async function removeMember(workspaceId, membershipId) {
  const membership = await Membership.findOne({ _id: membershipId, workspaceId });
  if (!membership) throw new TeamServiceError("Member not found", 404);
  if (membership.role === "owner") throw new TeamServiceError("Cannot remove the workspace owner", 400);
  await membership.deleteOne();
}

export async function updateMemberRole(workspaceId, membershipId, role) {
  const membership = await Membership.findOne({ _id: membershipId, workspaceId });
  if (!membership) throw new TeamServiceError("Member not found", 404);
  if (membership.role === "owner") throw new TeamServiceError("Owner role can't be changed", 400);
  membership.role = role;
  await membership.save();
  return membership;
}


export async function listMyInvites(userId, email) {
  return Membership.find({
    status: "invited",
    $or: [{ userId }, { email: email?.toLowerCase() }],
  })
    .populate("workspaceId", "name type")
    .populate("invitedBy", "fullname email")
    .sort({ invitedAt: -1 })
    .lean();
}

// export async function acceptInvite(membershipId, userId) {
//   const membership = await Membership.findById(membershipId);
//   if (!membership || membership.status !== "invited") {
//     throw new TeamServiceError("Invite not found or already handled", 404);
//   }
//   membership.status = "active";
//   membership.userId = membership.userId ?? userId;
//   membership.email = undefined; // clear once linked to a real account
//   membership.joinedAt = new Date();
//   await membership.save();
//   return membership.populate("workspaceId", "name type");
// }

export async function listMyRequests(userId) {
  return Membership.find({ userId, status: { $in: ["requested", "rejected"] } })
    .populate("workspaceId", "name type")
    .sort({ createdAt: -1 })
    .lean();
}

export async function declineInvite(membershipId) {
  const membership = await Membership.findById(membershipId);
  if (!membership || membership.status !== "invited") {
    throw new TeamServiceError("Invite not found or already handled", 404);
  }
  membership.status = "rejected";
  await membership.save();
  return membership;
}

export { TeamServiceError };