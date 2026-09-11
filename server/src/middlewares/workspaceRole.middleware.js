import { getMembershipRole } from "#services/team.service.js";

// Usage: requireWorkspaceRole(["owner", "admin"])
export function requireWorkspaceRole(allowedRoles) {

  return async (req, res, next) => {
    try {
      const { workspaceId } = req.params;
      const role = await getMembershipRole(workspaceId, req.user._id);

      if (!role) {
        return res.status(403).json({ success: false, message: "Not a member of this workspace" });
      }
      if (!allowedRoles.includes(role)) {
        return res.status(403).json({ success: false, message: "Insufficient permissions" });
      }

      req.membershipRole = role;
      
      next();
    } catch (err) {
      console.log(err);
      
      return res.status(500).json({ success: false, message: "Permission check failed" });
    }
  };
}