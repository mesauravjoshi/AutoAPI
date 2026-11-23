export type Workspace = {
  _id: string;
  name: string;
  owner: owner;
  members: string[];
  createdAt: string;
  updatedAt: string;
  type: string;
  myRole?: string;
};

type owner = {
  _id: string;
  fullname: string;
};
