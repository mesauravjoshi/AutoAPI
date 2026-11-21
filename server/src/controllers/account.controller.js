import * as accountService from "#services/account.service.js";

/**
 * Controller to handle permanent account deletion.
 * Method: DELETE or POST
 * Route: /api/account/delete
 */
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const email = req.body?.email || req.query?.email;

    const result = await accountService.deleteAccount({ userId, email });

    // Clear the refresh token cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    const status = error.status || error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || "Failed to delete account.",
    });
  }
};
