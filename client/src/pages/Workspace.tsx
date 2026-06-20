import CreateWorkspaceForm from '@/components/Workspace/CreateWorkspaceForm'
import api from '@/lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
}

const MOCK_USERS: User[] = [
  { id: "u1", name: "Aditi Sharma", email: "aditi.sharma@example.com" },
  { id: "u2", name: "Rohan Mehta", email: "rohan.mehta@example.com" },
  { id: "u3", name: "Priya Nair", email: "priya.nair@example.com" },
  { id: "u4", name: "Karan Singh", email: "karan.singh@example.com" },
  { id: "u5", name: "Sneha Patel", email: "sneha.patel@example.com" },
  { id: "u6", name: "Arjun Verma", email: "arjun.verma@example.com" },
  { id: "u7", name: "Meera Iyer", email: "meera.iyer@example.com" },
  { id: "u8", name: "Vikram Rao", email: "vikram.rao@example.com" },
];

export default function Index() {

  return (
    <>
      <CreateWorkspaceForm
        users={MOCK_USERS}
        onSubmit={async (data) => {
          // data: { workspaceName: string; users: string[] }
          const payload = { name: data.workspaceName, userIds: data.users };
          await api.post("/workspaces", payload);
        }}
      />
    </>
  )
}
