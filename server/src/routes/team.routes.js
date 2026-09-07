import express from "express";
import * as teamController from "../controllers/team.controller.js";
// import { requireAuth } from "../middlewares/auth.middleware.js"; // your existing auth mw
import { protect } from "#middlewares/auth.middleware.js";
import { requireWorkspaceRole } from "../middlewares/workspaceRole.middleware.js";

const router = express.Router({ mergeParams: true });

router.use(protect);

// reads — any active member can view
router.get("/members", requireWorkspaceRole(["owner", "admin", "editor", "viewer"]), teamController.getMembers); // ✅
router.get("/invites", requireWorkspaceRole(["owner", "admin"]), teamController.getInvites); // ✅
router.get("/requests", requireWorkspaceRole(["owner", "admin"]), teamController.getRequests);
router.get("/search-users", requireWorkspaceRole(["owner", "admin"]), teamController.searchUsers); // ✅

// writes — only owner/admin
router.post("/invite", requireWorkspaceRole(["owner", "admin"]), teamController.inviteMember); // ✅
router.post("/requests/:membershipId/approve", requireWorkspaceRole(["owner", "admin"]), teamController.approveRequest);
router.post("/requests/:membershipId/reject", requireWorkspaceRole(["owner", "admin"]), teamController.rejectRequest);
router.delete("/members/:membershipId", requireWorkspaceRole(["owner", "admin"]), teamController.removeMember); // ✅
router.patch("/members/:membershipId/role", requireWorkspaceRole(["owner", "admin"]), teamController.updateMemberRole);

export default router;