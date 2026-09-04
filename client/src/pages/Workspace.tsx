import CreateWorkspaceForm from '@/components/Workspace/CreateWorkspaceForm'
import api from '@/lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
}

export default function Index() {

  return (
    <>
      <CreateWorkspaceForm
        onSubmit={async (data) => {
          const payload = {
            name: data.workspaceName,
            type: data.workspaceType,
          };
          await new Promise((resolve) => setTimeout(resolve, 4000));

          await api.post("/workspaces", payload);
        }}
      />
    </>
  )
}