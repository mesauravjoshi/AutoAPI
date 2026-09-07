import api from "@/lib/api";
import { Membership, MembershipRole, TeamUser, MyInvite, MyRequest } from "@/types/team.type";

export const teamService = {
  getMembers: (workspaceId: string) =>
    api.get<{ data: Membership[] }>(`/workspaces/${workspaceId}/team/members`),

  getInvites: (workspaceId: string) =>
    api.get<{ data: Membership[] }>(`/workspaces/${workspaceId}/team/invites`),

  getRequests: (workspaceId: string) =>
    api.get<{ data: Membership[] }>(`/workspaces/${workspaceId}/team/requests`),

  searchUsers: (workspaceId: string, q: string) =>
    api.get<{ data: TeamUser[] }>(`/workspaces/${workspaceId}/team/search-users`, { params: { q } }),

  invite: (workspaceId: string, payload: { userId?: string; email?: string; role: MembershipRole }) =>
    api.post(`/workspaces/${workspaceId}/team/invite`, payload),

  approveRequest: (workspaceId: string, membershipId: string) =>
    api.post(`/workspaces/${workspaceId}/team/requests/${membershipId}/approve`),

  rejectRequest: (workspaceId: string, membershipId: string) =>
    api.post(`/workspaces/${workspaceId}/team/requests/${membershipId}/reject`),

  removeMember: (workspaceId: string, membershipId: string) =>
    api.delete(`/workspaces/${workspaceId}/team/members/${membershipId}`),

  updateRole: (workspaceId: string, membershipId: string, role: MembershipRole) =>
    api.patch(`/workspaces/${workspaceId}/team/members/${membershipId}/role`, { role }),


  getMyInvites: () => api.get<{ data: MyInvite[] }>(`/team/invites/me`),
  getMyRequests: () => api.get<{ data: MyRequest[] }>(`/team/requests/me`),
  acceptInvite: (membershipId: string) => api.post(`/team/invites/${membershipId}/accept`),
  declineInvite: (membershipId: string) => api.post(`/team/invites/${membershipId}/decline`),
};

