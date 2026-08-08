import { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/UI/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/UI/dialog";
import { useAuth } from "@/hooks/useAuth";

interface SignOutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
}

export const SignOutModal = ({
  open,
  onOpenChange,
  onConfirm,
}: SignOutModalProps) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6 gap-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl">
        <DialogHeader className="flex flex-col items-center text-center gap-3 bg-transparent">
          {/* Glowing Red Icon Badge */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-red-500/20 dark:bg-red-500/30 blur-md" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/60 ring-8 ring-red-50/50 dark:ring-red-950/30 text-red-600 dark:text-red-400">
              <LogOut className="h-6 w-6" />
            </div>
          </div>

          <div className="space-y-1.5 mt-1">
            <DialogTitle className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Sign Out?
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
              Are you sure you want to sign out of your account?
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* User context card */}
        {user && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800/80">
            <img
              src={
                user.picture ||
                `https://ui-avatars.com/api/?name=${user.username || "User"}&background=random&color=fff&size=128`
              }
              alt={user.username || "User"}
              className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 object-cover ring-2 ring-gray-200 dark:ring-gray-700"
            />
            <div className="flex flex-col min-w-0 text-left">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                {user.username}
              </span>
              {user.email && (
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </span>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="m-0 p-0 border-t-0 flex flex-row gap-3 justify-end bg-transparent">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => onOpenChange(false)}
            className="flex-1 sm:flex-initial h-10 px-5 rounded-xl border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium transition-all cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="destructive"
            disabled={loading}
            onClick={handleConfirm}
            className="flex-1 sm:flex-initial h-10 px-5 rounded-xl bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 text-white font-medium shadow-md hover:shadow-lg transition-all cursor-pointer gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing out...
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4" />
                Sign Out
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
