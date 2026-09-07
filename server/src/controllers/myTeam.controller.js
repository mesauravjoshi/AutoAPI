import * as teamService from "#services/team.service.js";

const handle = (fn) => async (req, res) => {
  try {
    const data = await fn(req);
    return res.json({ success: true, data });
  } catch (err) {
    // console.log('errrrror line 8:',err);
    
    const status = err.statusCode || 500;
    return res.status(status).json({ success: false, message: err.message || "Something went wrong" });
  }
};

export const getMyInvites = handle((req) => teamService.listMyInvites(req.user.id, req.user.email));
export const acceptInvite = handle((req) => teamService.acceptInvite(req.params.membershipId, req.user.id));
export const declineInvite = handle((req) => teamService.declineInvite(req.params.membershipId));