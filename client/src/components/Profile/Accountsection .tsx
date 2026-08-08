import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Shield, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { updateEmail } from "@/services/profileService";
import type { UpdateEmailPayload } from "@/services/profileService";
import Input from "@/components/UI/Common/Input";
import PasswordInput from "@/components/UI/Common/PasswordInput";
import { SaveButton } from "@/components/UI/Common/Savebutton";
import { SectionCard } from "@/components/UI/Common/Sectioncard ";

// ─── Account Section ──────────────────────────────────────────────────────────

export function AccountSection() {
  const { user, updateUser } = useAuth();
  const isGoogleUser = user?.provider === "google";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateEmailPayload>({
    defaultValues: { newEmail: "", password: "" },
  });

  const onSubmit = async (data: UpdateEmailPayload) => {
    try {
      const res = await updateEmail(data);
      updateUser(res.data.user);
      toast.success("Email updated successfully!");
      reset();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update email.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Email Update */}
      <SectionCard
        title="Email Address"
        description="Update the email associated with your account"
      >
        {isGoogleUser ? (
          <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 p-4 flex items-start gap-3">
            <div className="mt-0.5 size-5 text-blue-500 shrink-0">
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Email managed by Google
              </p>
              <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                Your email <span className="font-medium">{user?.email}</span> is
                managed by Google Sign-In and cannot be changed here.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/60 px-4 py-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Current email:
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {user?.email}
              </span>
            </div>
            <Input
              id="newEmail"
              label="New email address"
              type="email"
              placeholder="new@example.com"
              autoComplete="email"
              error={errors.newEmail?.message}
              {...register("newEmail", {
                required: "New email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address",
                },
              })}
            />
            <PasswordInput
              id="emailPassword"
              label="Confirm with your password"
              placeholder="Current password"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register("password", {
                required: "Password is required to change email",
              })}
            />
            <div className="flex justify-end">
              <SaveButton isSubmitting={isSubmitting} label="Update Email" />
            </div>
          </form>
        )}
      </SectionCard>

      {/* 2FA Placeholder */}
      <SectionCard
        title="Two-Factor Authentication"
        description="Add an extra layer of security to your account"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 p-2 rounded-lg bg-gray-100 dark:bg-gray-700/60">
              <Shield className="size-5 text-gray-500 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                Authenticator app
              </p>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                Use an authenticator app to generate one-time codes.
              </p>
            </div>
          </div>
          <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
            <span className="size-1.5 rounded-full bg-amber-500 inline-block" />
            Coming Soon
          </span>
        </div>
      </SectionCard>

      {/* Danger Zone */}
      <SectionCard
        title="Danger Zone"
        description="Irreversible and destructive actions"
      >
        <div className="rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10 p-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                Delete Account
              </p>
              <p className="mt-0.5 text-sm text-red-600/80 dark:text-red-400/70">
                Permanently delete your account and all associated data. This
                action cannot be undone.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                toast.error("Account deletion coming soon!", { icon: "⚠️" })
              }
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-red-600 dark:text-red-400 border border-red-300 dark:border-red-800/60 bg-white dark:bg-transparent hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <AlertTriangle className="size-4" />
              Delete Account
            </button>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

export default AccountSection;