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

export const getMembers = handle((req) => teamService.listMembers(req.params.workspaceId));
export const getInvites = handle((req) => teamService.listInvites(req.params.workspaceId));
export const getRequests = handle((req) => teamService.listRequests(req.params.workspaceId));
export const searchUsers = handle((req) =>
  teamService.searchInvitableUsers(req.params.workspaceId, req.query.q)
);

export const inviteMember = handle((req) =>
  teamService.inviteMember({
    workspaceId: req.params.workspaceId,
    email: req.body.email,
    userId: req.body.userId,
    role: req.body.role || "viewer",
    invitedBy: req.user.id,
  })
);

export const approveRequest = handle((req) =>
  teamService.respondToRequest(req.params.membershipId, { approve: true })
);
export const rejectRequest = handle((req) =>
  teamService.respondToRequest(req.params.membershipId, { approve: false })
);
export const removeMember = handle((req) =>
  teamService.removeMember(req.params.workspaceId, req.params.membershipId)
);
export const updateMemberRole = handle((req) =>
  teamService.updateMemberRole(req.params.workspaceId, req.params.membershipId, req.body.role)
);


export const getMyInvites = handle((req) => teamService.listMyInvites(req.user.id, req.user.email));
export const getMyRequests = handle((req) => teamService.listMyRequests(req.user.id));
export const acceptInvite = handle((req) => teamService.acceptInvite(req.params.membershipId, req.user.id));
export const declineInvite = handle((req) => teamService.declineInvite(req.params.membershipId));