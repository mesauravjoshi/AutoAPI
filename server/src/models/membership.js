import mongoose from "mongoose";

const membershipSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // not required — a pending invite may not have a User yet
    },
    email: {
      type: String, // used for invites before the user has an account
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["owner", "admin", "editor", "viewer"],
      default: "viewer",
    },
    status: {
      type: String,
      enum: ["pending", "active"],
      default: "pending",
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

// one membership per user (or invited email) per workspace
membershipSchema.index({ workspaceId: 1, userId: 1 }, { unique: true, sparse: true });
membershipSchema.index({ workspaceId: 1, email: 1 }, { unique: true, sparse: true });

export default mongoose.model("Membership", membershipSchema);