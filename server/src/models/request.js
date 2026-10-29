import mongoose from "mongoose";

const keyValueSchema = new mongoose.Schema(
  {
    key: { type: String, trim: true },
    value: { type: String, trim: true },
  },
  { _id: false }
);

const requestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    method: {
      type: String,
      enum: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      required: true,
    },

    url: {
      type: String,
      required: true,
      trim: true,
    },

    collectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collection",
      // required: true,
      index: true,
    },

    // request config
    headers: [keyValueSchema],

    queryParams: [keyValueSchema],

    body: {
      type: {
        type: String,
        enum: ["json", "form-data", "urlencoded", "raw"],
        default: "json",
      },
      content: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
    },

    // response snapshot (optional)
    lastResponse: {
      status: Number,
      data: mongoose.Schema.Types.Mixed,
      time: Number, // in ms
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
    versionKey: false,
  }
);

// Optional: index for faster queries inside a collection
requestSchema.index({ collectionId: 1, name: 1 });

const Request =
  mongoose.models.Request || mongoose.model("Request", requestSchema);
  
// const Request = mongoose.model("Request", requestSchema);

export default Request;