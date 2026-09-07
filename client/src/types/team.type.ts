export type MembershipRole = "owner" | "admin" | "editor" | "viewer";
export type MembershipStatus = "invited" | "requested" | "active" | "rejected";

export interface TeamUser {
  _id: string;
  fullname: string;
  email: string;
  picture?: string;
}

export interface Membership {
  _id: string;
  workspaceId: string;
  userId?: TeamUser;
  email?: string;
  role: MembershipRole;
  status: MembershipStatus;
  invitedBy?: TeamUser;
  invitedAt: string;
  joinedAt?: string;
  createdAt: string;
}

export interface MyInvite {
  _id: string;
  workspaceId: { _id: string; name: string; type: string };
  role: MembershipRole;
  invitedBy?: { _id: string; fullname: string; email: string };
  invitedAt: string;
}

export interface MyRequest {
  _id: string;
  workspaceId: { _id: string; name: string; type: string };
  status: "requested" | "rejected";
  createdAt: string;
}