import mongoose from "mongoose";

export const MEMBERSHIP_ROLES = ["owner", "admin", "editor", "viewer"];
export const MEMBERSHIP_STATUS = ["invited", "requested", "active", "rejected"];

const membershipSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    // userId is absent until an invited person actually has/creates an account
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: MEMBERSHIP_ROLES,
      default: "viewer",
    },
    // invited   -> admin sent an invite, waiting for the person to accept
    // requested -> user asked to join (public workspaces), waiting for approval
    // active    -> a real member
    // rejected  -> request/invite was declined
    status: {
      type: String,
      enum: MEMBERSHIP_STATUS,
      default: "invited",
      index: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    invitedAt: { type: Date, default: Date.now },
    joinedAt: Date,
  },
  { timestamps: true, versionKey: false }
);

// one row per (workspace, user) and one row per (workspace, email)
membershipSchema.index({ workspaceId: 1, userId: 1 }, { unique: true, sparse: true });
membershipSchema.index(
  { workspaceId: 1, email: 1 },
  { unique: true, partialFilterExpression: { email: { $type: "string" } } }
);

const Membership = mongoose.models.Membership || mongoose.model("Membership", membershipSchema);
export default Membership;