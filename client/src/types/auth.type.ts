export type UserModelInterface = {
  id: string;
  username: string;
  firstname?: string;
  lastname?: string;
  fullname?: string;
  email: string;
  picture?: string | null;
  googleId?: string;
  provider: "local" | "google";
  createdAt: string; // ISO date string from API
};

export type Workspace = {
  _id: string;
  name: string;
  ownerId: string;
  members: string[];
  createdAt: string;
  updatedAt: string;
}

export type AuthContextType = {
  user: UserModelInterface | null;
  token: string | null;
  currentWorkspace: Workspace | null;
  setCurrentWorkspace: React.Dispatch<React.SetStateAction<Workspace | null>>;
  updateCurrentWorkspace: (workspace: Workspace) => void;
  loading: boolean;
  login: (data: { user: UserModelInterface; token: string; workspace: Workspace }) => void;
  logout: () => void;
  fetchUserData: () => Promise<void>;
  updateUser: (patch: Partial<UserModelInterface>) => void;
};