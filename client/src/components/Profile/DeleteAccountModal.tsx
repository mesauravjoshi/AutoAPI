import { useState } from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/UI/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/UI/dialog";
import toast from "react-hot-toast";
import { deleteAccountApi } from "@/services/account.service";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface DeleteAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DeleteAccountModal = ({
  open,
  onOpenChange,
}: DeleteAccountModalProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [confirmEmail, setConfirmEmail] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userEmail = user?.email || "";
  const isEmailMatch =
    confirmEmail.trim().toLowerCase() === userEmail.toLowerCase();

  const handleClose = () => {
    if (isDeleting) return;
    setConfirmEmail("");
    setError(null);
    onOpenChange(false);
  };

  const handleDelete = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!confirmEmail.trim()) {
      setError("Please enter your email to confirm.");
      return;
    }

    if (!isEmailMatch) {
      setError("Entered email does not match your account email.");
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);

      const res = await deleteAccountApi({ email: confirmEmail.trim() });
      toast.success(res.data?.message || "Account deleted successfully.");

      handleClose();
      logout();
      navigate("/login");
      window.location.href = "/login";
    } catch (err: unknown) {
      let message = "Failed to delete account. Please try again.";
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message || err.message || message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => (!val ? handleClose() : onOpenChange(val))}
    >
      <DialogContent className="sm:max-w-md p-6 gap-6 rounded-2xl border border-red-200 dark:border-red-900/50 bg-white dark:bg-gray-900 shadow-2xl">
        <DialogHeader className="flex flex-col items-center text-center gap-3 bg-transparent">
          {/* Warning Icon Badge */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-red-500/20 dark:bg-red-500/30 blur-md" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/60 ring-8 ring-red-50/50 dark:ring-red-950/30 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </div>

          <div className="space-y-1.5 mt-1">
            <DialogTitle className="text-xl font-bold tracking-tight text-red-600 dark:text-red-400">
              Delete Account
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              This action is <span className="font-semibold text-red-600 dark:text-red-400">permanent and cannot be undone</span>. All your data including workspaces, collections, requests, and request history will be permanently deleted.
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleDelete} className="space-y-4">
          <div className="rounded-lg bg-red-50/80 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 p-3.5 text-xs text-red-700 dark:text-red-300">
            <p className="font-medium">
              To verify deletion, please type your email address below:
            </p>
            <p className="font-mono font-semibold mt-1 text-gray-900 dark:text-gray-100 select-all">
              {userEmail}
            </p>
          </div>

          <div>
            <label
              htmlFor="confirm-delete-email"
              className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Confirm Email
            </label>
            <input
              id="confirm-delete-email"
              type="email"
              value={confirmEmail}
              onChange={(e) => {
                setConfirmEmail(e.target.value);
                if (error) setError(null);
              }}
              placeholder={userEmail}
              autoComplete="off"
              disabled={isDeleting}
              className="block w-full rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/60 focus:border-red-500 transition-all"
            />
            {error && (
              <p className="mt-1.5 text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                <AlertTriangle className="size-3.5 shrink-0" />
                {error}
              </p>
            )}
          </div>

          <DialogFooter className="m-0 p-0 border-t-0 flex flex-row gap-3 justify-end bg-transparent pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={handleClose}
              className="flex-1 sm:flex-initial h-10 px-5 rounded-xl border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium transition-all cursor-pointer"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="destructive"
              disabled={!isEmailMatch || isDeleting}
              className="flex-1 sm:flex-initial h-10 px-5 rounded-xl bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 text-white dark:text-gray-200 font-medium shadow-md hover:shadow-lg transition-all cursor-pointer gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Account</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
