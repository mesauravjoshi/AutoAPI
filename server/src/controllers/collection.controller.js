import mongoose from "mongoose";
import Collection from "#models/collection.js";
import Request from "#models/request.js";

export const getCollections = async (req, res) => {
  try {
    const userId = req.user.id;

    const collections = await Collection.aggregate([
      // Join workspace
      {
        $lookup: {
          from: "workspaces",
          localField: "workspaceId",
          foreignField: "_id",
          as: "workspace",
        },
      },

      // Convert workspace array to object
      {
        $unwind: "$workspace",
      },

      // Access control
      {
        $match: {
          $or: [
            {
              "workspace.ownerId": new mongoose.Types.ObjectId(userId),
            },
            {
              "workspace.members": new mongoose.Types.ObjectId(userId),
            },
            {
              createdBy: new mongoose.Types.ObjectId(userId),
            },
          ],
        },
      },

      // Populate creator details
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "creator",
        },
      },

      {
        $unwind: {
          path: "$creator",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Get requests using collectionId
      {
        $lookup: {
          from: "requests", // MongoDB collection name
          localField: "_id",
          foreignField: "collectionId",
          as: "requests",
        },
      },

      // Final response shape
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          createdAt: 1,
          updatedAt: 1,

          workspace: {
            _id: "$workspace._id",
            name: "$workspace.name",
          },

          createdBy: {
            _id: "$creator._id",
            username: "$creator.username",
            email: "$creator.email",
          },

          // Include request data
          requests: {
            $map: {
              input: "$requests",
              as: "req",
              in: {
                _id: "$$req._id",
                name: "$$req.name",
                method: "$$req.method",
                url: "$$req.url",
                headers: "$$req.headers",
                queryParams: "$$req.queryParams",
                body: "$$req.body",
                lastResponse: "$$req.lastResponse",
                createdAt: "$$req.createdAt",
                updatedAt: "$$req.updatedAt",
              },
            },
          },

          // Optional request count
          requestCount: {
            $size: "$requests",
          },
        },
      },

      // Sort collections
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      count: collections.length,
      collections,
    });
  } catch (error) {
    console.error("Error fetching collections:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch collections",
      error: error.message,
    });
  }
};

export const createCollection = async (req, res) => {
  try {
    const { name, description, workspaceId } = req.body;

    // Validate required fields
    if (!name || !workspaceId) {
      return res.status(400).json({
        success: false,
        message: "Name and workspaceId are required",
      });
    }

    // Check duplicate collection name inside same workspace
    const existingCollection = await Collection.findOne({
      workspaceId,
      name: name.trim(),
    });

    if (existingCollection) {
      return res.status(409).json({
        success: false,
        message: "Collection with this name already exists in this workspace",
      });
    }

    // Create collection
    const collection = await Collection.create({
      name: name.trim(),
      description,
      workspaceId,
      createdBy: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Collection created successfully",
      data: collection,
    });
  } catch (error) {
    console.error("Create Collection Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Delete a collection
export const deleteCollection = async (req, res) => {
  try {
    const { id } = req.params;

    // Find collection
    const collection = await Collection.findById(id);

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: "Collection not found",
      });
    }

    // Optional: check ownership
    // if (collection.createdBy.toString() !== req.user._id.toString()) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Unauthorized",
    //   });
    // }

    // Delete all requests inside collection
    await Request.deleteMany({
      collectionId: id,
    });

    // Delete collection
    await Collection.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Collection deleted successfully",
    });
  } catch (error) {
    console.error("Delete Collection Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};