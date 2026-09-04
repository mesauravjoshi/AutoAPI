import mongoose from "mongoose";

const WORKSPACE_TYPES = ["personal", "internal", "partner", "public"];

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    type: {
      type: String,
      enum: WORKSPACE_TYPES,
      required: true,
      default: "internal",
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Enforce "personal" workspaces never carry members other than the owner
workspaceSchema.pre("validate", function (next) {
  if (this.type === "personal") {
    this.members = [];
  }
  next();
});

workspaceSchema.index(
  { ownerId: 1, name: 1 },
  { unique: true }
);

const Workspace =
  mongoose.models.Workspace ||
  mongoose.model("Workspace", workspaceSchema);

export default Workspace;