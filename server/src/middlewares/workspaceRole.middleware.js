import { getMembershipRole } from "#services/team.service.js";

// Usage: requireWorkspaceRole(["owner", "admin"])
export function requireWorkspaceRole(allowedRoles) {

  return async (req, res, next) => {
    try {
      const { workspaceId } = req.params;
      // console.log('workspaceId',workspaceId);
      // console.log(req.user._id);
      
      const role = await getMembershipRole(workspaceId, req.user._id);
      // console.log('role', role);

      if (!role) {
        return res.status(403).json({ success: false, message: "Not a member of this workspace" });
      }
      if (!allowedRoles.includes(role)) {
        return res.status(403).json({ success: false, message: "Insufficient permissions" });
      }

      req.membershipRole = role;
      console.log('going on next........');
      
      next();
    } catch (err) {
      console.log(err);
      
      return res.status(500).json({ success: false, message: "Permission check failed" });
    }
  };
}