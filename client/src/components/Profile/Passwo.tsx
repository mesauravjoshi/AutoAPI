import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  getPasswordStatus,
  createPassword,
  changePassword,
} from "@/services/profileService";
import type {
  CreatePasswordPayload,
  ChangePasswordPayload,
} from "@/services/profileService";
import PasswordInput from "@/components/UI/Common/PasswordInput";
import { SaveButton } from "@/components/UI/Common/Savebutton";
import { SectionCard } from "@/components/UI/Common/Sectioncard ";

// ─── Password Section ─────────────────────────────────────────────────────────

export function PasswordSection() {
  const { user } = useAuth();
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await getPasswordStatus();
        setHasPassword(res.data.hasPassword);
      } catch {
        toast.error("Could not load password status.");
        setHasPassword(false);
      } finally {
        setLoadingStatus(false);
      }
    };
    fetchStatus();
  }, [user]);

  if (loadingStatus) {
    return (
      <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700/60 shadow-sm p-10 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-7 animate-spin text-indigo-500" />
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Checking password status…
          </p>
        </div>
      </div>
    );
  }

  return hasPassword ? (
    <ChangePasswordForm />
  ) : (
    <CreatePasswordForm onPasswordCreated={() => setHasPassword(true)} />
  );
}

// ─── Create Password Form ─────────────────────────────────────────────────────

function CreatePasswordForm({ onPasswordCreated }: { onPasswordCreated: () => void }) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreatePasswordPayload>({
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const newPassword = watch("newPassword");

  const onSubmit = async (data: CreatePasswordPayload) => {
    try {
      await createPassword(data);
      toast.success("Password created! You can now sign in with email & password.");
      reset();
      onPasswordCreated();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create password.");
    }
  };

  return (
    <SectionCard
      title="Create Password"
      description="Your account uses Google Sign-In. Set a local password to also sign in with email & password."
    >
      <div className="mb-6 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/40 p-4 flex items-start gap-3">
        <div className="mt-0.5">
          <Lock className="size-5 text-indigo-500 dark:text-indigo-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-indigo-800 dark:text-indigo-300">
            No password set
          </p>
          <p className="mt-0.5 text-sm text-indigo-600/80 dark:text-indigo-400/70">
            You signed up with Google. Create a password below to enable
            email/password login alongside Google.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <PasswordInput
          id="cp-newPassword"
          label="New password"
          placeholder="Minimum 8 characters"
          autoComplete="new-password"
          error={errors.newPassword?.message}
          {...register("newPassword", {
            required: "Password is required",
            minLength: { value: 8, message: "Minimum 8 characters" },
          })}
        />

        {/* Password strength hint */}
        {newPassword && (
          <div className="space-y-1.5">
            <div className="flex gap-1">
              {[
                newPassword.length >= 8,
                /[A-Z]/.test(newPassword),
                /[0-9]/.test(newPassword),
                /[^a-zA-Z0-9]/.test(newPassword),
              ].map((met, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${met
                      ? "bg-green-500"
                      : "bg-gray-200 dark:bg-gray-700"
                    }`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Strong passwords include uppercase, numbers, and special characters.
            </p>
          </div>
        )}

        <PasswordInput
          id="cp-confirmPassword"
          label="Confirm password"
          placeholder="Re-enter new password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword", {
            required: "Please confirm your password",
            validate: (val) =>
              val === newPassword || "Passwords do not match",
          })}
        />

        <div className="flex justify-end pt-1">
          <SaveButton isSubmitting={isSubmitting} label="Create Password" />
        </div>
      </form>
    </SectionCard>
  );
}

// ─── Change Password Form ─────────────────────────────────────────────────────

function ChangePasswordForm() {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordPayload>({
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const newPassword = watch("newPassword");

  const onSubmit = async (data: ChangePasswordPayload) => {
    try {
      await changePassword(data);
      toast.success("Password changed successfully!");
      reset();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to change password.");
    }
  };

  return (
    <SectionCard
      title="Change Password"
      description="Update your password to keep your account secure"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <PasswordInput
          id="chp-current"
          label="Current password"
          placeholder="Enter current password"
          autoComplete="current-password"
          error={errors.currentPassword?.message}
          {...register("currentPassword", {
            required: "Current password is required",
          })}
        />

        <div className="border-t border-gray-100 dark:border-gray-700/60 pt-5 space-y-5">
          <PasswordInput
            id="chp-new"
            label="New password"
            placeholder="Minimum 8 characters"
            autoComplete="new-password"
            error={errors.newPassword?.message}
            {...register("newPassword", {
              required: "New password is required",
              minLength: { value: 8, message: "Minimum 8 characters" },
            })}
          />

          {/* Password strength */}
          {newPassword && (
            <div className="space-y-1.5">
              <div className="flex gap-1">
                {[
                  newPassword.length >= 8,
                  /[A-Z]/.test(newPassword),
                  /[0-9]/.test(newPassword),
                  /[^a-zA-Z0-9]/.test(newPassword),
                ].map((met, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors ${met ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"
                      }`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Strong passwords include uppercase, numbers, and special characters.
              </p>
            </div>
          )}

          <PasswordInput
            id="chp-confirm"
            label="Confirm new password"
            placeholder="Re-enter new password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (val) =>
                val === newPassword || "Passwords do not match",
            })}
          />
        </div>

        <div className="flex justify-end pt-1">
          <SaveButton isSubmitting={isSubmitting} label="Change Password" />
        </div>
      </form>
    </SectionCard>
  );
}

export default PasswordSection;