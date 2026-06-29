export type UserModelInterface = {
  username: string;
  email: string;
  userId: string;
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
  loading: boolean;
  login: (data: { user: UserModelInterface; token: string; workspace: Workspace }) => void;
  logout: () => void;
  fetchUserData: () => Promise<void>;
};