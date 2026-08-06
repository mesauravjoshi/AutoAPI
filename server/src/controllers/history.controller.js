import RequestHistory from "#models/history.js";

/**
 * GET /api/history
 * Get all history for logged-in user
 */
export const historyRequest = async (req, res) => {
  try {
    const userId = req.user.id;

    const history = await RequestHistory.find({ userId }).sort({ testedAt: -1 });
    return res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    console.error("History fetch error:", error);

    return res.status(500).json({
      success: false,
      error: "Failed to fetch history",
    });
  }
};

export const historyDelete = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const deletedHistory = await RequestHistory.findOneAndDelete({
      _id: id,
      userId, // ensures user can only delete own history
    });

    if (!deletedHistory) {
      return res.status(404).json({
        success: false,
        message: "History record not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "History deleted successfully",
      deletedId: id,
    });

  } catch (error) {
    console.error("History delete error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete history",
    });
  }
};
