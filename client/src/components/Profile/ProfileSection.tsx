import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Camera } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { updateProfile } from "@/services/profileService";
import type { UpdateProfilePayload } from "@/services/profileService";
import Input from "@/components/UI/Common/Input";
import { SaveButton } from "@/components/UI/Common/Savebutton";
import { SectionCard } from "@/components/UI/Common/Sectioncard ";

// ─── Profile Section ──────────────────────────────────────────────────────────

export function ProfileSection() {
  const { user, updateUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfilePayload>({
    defaultValues: {
      firstname: user?.firstname || "",
      lastname: user?.lastname || "",
      username: user?.username || "",
    },
  });

  const onSubmit = async (data: UpdateProfilePayload) => {
    try {
      const res = await updateProfile(data);
      updateUser(res.data.user);
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to update profile."
      );
    }
  };

  const avatarUrl =
    user?.picture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.firstname || user?.username || "User"
    )}&background=6366f1&color=fff&size=128&bold=true`;

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <SectionCard
        title="Profile Photo"
        description="Your profile photo is shown across the app"
      >
        <div className="flex items-center gap-5">
          <div className="relative group">
            <img
              src={avatarUrl}
              alt="Profile avatar"
              className="size-20 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700 shadow-md"
            />
            {user?.provider === "google" && (
              <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-0.5 ring-1 ring-gray-200 dark:ring-gray-700">
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  className="size-4"
                />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                onClick={() =>
                  toast("Avatar upload coming soon!", { icon: "🖼️" })
                }
              >
                <Camera className="size-4" />
                Change photo
              </button>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              JPG, PNG or GIF. Max 2MB.{" "}
              {user?.provider === "google" && (
                <span className="text-indigo-500 dark:text-indigo-400">
                  Synced from Google
                </span>
              )}
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Name & Username */}
      <SectionCard
        title="Personal Information"
        description="Update your name and username"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              id="firstname"
              label="First name"
              placeholder="John"
              error={errors.firstname?.message}
              {...register("firstname", {
                required: "First name is required",
                minLength: { value: 1, message: "Too short" },
              })}
            />
            <Input
              id="lastname"
              label="Last name"
              placeholder="Doe"
              error={errors.lastname?.message}
              {...register("lastname")}
            />
          </div>
          <Input
            id="username"
            label="Username"
            placeholder="johndoe"
            error={errors.username?.message}
            {...register("username", {
              required: "Username is required",
              minLength: { value: 3, message: "Minimum 3 characters" },
              pattern: {
                value: /^[a-zA-Z0-9_]+$/,
                message: "Only letters, numbers and underscores",
              },
            })}
          />

          {/* Current info display */}
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/60 px-4 py-3 flex flex-wrap gap-4 text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              Provider:{" "}
              <span className="font-medium capitalize text-gray-700 dark:text-gray-300">
                {user?.provider}
              </span>
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              Member since:{" "}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                  })
                  : "—"}
              </span>
            </span>
          </div>

          <div className="flex justify-end">
            <SaveButton isSubmitting={isSubmitting} />
          </div>
        </form>
      </SectionCard>
    </div>
  );
}

export default ProfileSection;