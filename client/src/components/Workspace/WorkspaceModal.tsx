import { Workspace } from "@/types/auth.type";
import { useEffect, useState } from "react";
import { Button } from "@/components/UI/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/UI/dialog";
import api from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";


type WorkspaceModalProps = {
  workspaceOpen: boolean;
  setWorkspaceOpen: (open: boolean) => void;
};

export const WorkspaceModal = ({
  workspaceOpen,
  setWorkspaceOpen,
}: WorkspaceModalProps) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(false);
  const { currentWorkspace, setCurrentWorkspace } = useAuth();
  console.log(currentWorkspace);

  const Navigate = useNavigate();
  useEffect(() => {
    if (!workspaceOpen) return;

    const fetchWorkspaces = async () => {
      try {
        setLoading(true);

        const response = await api.get("/workspaces");
        setWorkspaces(response.data.data);
      } catch (error) {
        console.error("Failed to fetch workspaces", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, [workspaceOpen]);

  const changeWorkspace = (workspace: Workspace) => {
    // console.log(workspace);
    setCurrentWorkspace(workspace);
    setWorkspaceOpen(false);
  };

  return (
    <Dialog open={workspaceOpen} onOpenChange={setWorkspaceOpen}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Current Workspaces</DialogTitle>
          <div className="flex items-center justify-between">
            <div className="my-3">
              <DialogDescription>
                Select a workspace or create a new one.
              </DialogDescription>
            </div>

            <Button size="sm" onClick={() => {
              Navigate('/workspace/list');
            }}>
              View all workspace
            </Button>
          </div>
        </DialogHeader>

        <div className="max-h-80 space-y-2 overflow-y-auto">
          {loading && <p>Loading...</p>}

          {!loading &&
            workspaces.map((workspace) => (
              <div
                key={workspace._id}
                onClick={() => changeWorkspace(workspace)}
                className="rounded-lg border p-3 hover:bg-muted/50 cursor-pointer"
              >
                <h4 className="font-medium">{workspace.name}</h4>

                {/* {workspace.description && (
                  <p className="text-sm text-muted-foreground">
                    {workspace.description}
                  </p>
                )} */}
              </div>
            ))}

          {!loading && workspaces.length === 0 && (
            <p className="text-muted-foreground">
              No workspaces found.
            </p>
          )}
        </div>

        <DialogFooter>
          <div className="w-full flex gap-4 justify-between">
            <Button
              onClick={() => {
                setWorkspaceOpen(false);
                Navigate('/workspace');
              }}
            >
              Create Workspace
            </Button>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};