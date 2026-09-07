import express from "express";
import * as teamController from "../controllers/team.controller.js";
// import { requireAuth } from "../middlewares/auth.middleware.js"; // your existing auth mw
import { protect } from "#middlewares/auth.middleware.js";


const router = express.Router({ mergeParams: true });

router.use(protect);

router.get("/invites/me", teamController.getMyInvites);
router.get("/requests/me", teamController.getMyRequests);
router.post("/invites/:membershipId/accept", teamController.acceptInvite);
router.post("/invites/:membershipId/decline", teamController.declineInvite);

export default router;