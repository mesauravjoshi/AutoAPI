import { Button } from "@/components/UI/button"
import {
  type FC,
} from "react";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { BlocksIcon, Building2Icon, HandshakeIcon, GlobeIcon, UserIcon, type LucideIcon } from "lucide-react";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

export type WorkspaceType = "personal" | "internal" | "partner" | "public";

export interface CreateWorkspaceFormValues {
  workspaceName: string;
  workspaceType: WorkspaceType;
}

export interface CreateWorkspaceFormProps {
  /** Called with the validated form data on submit. */
  onSubmit?: (data: CreateWorkspaceFormValues) => Promise<void> | void;
}

const INPUT_CLASSES =
  "block w-full rounded-md bg-white dark:bg-gray-800 px-3 py-2.5 text-base text-gray-900 dark:text-white outline-1 -outline-offset-1 outline-gray-300 dark:outline-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 dark:focus:outline-indigo-400 sm:text-sm/6 transition-colors";

const INPUT_ERROR_CLASSES =
  "outline-red-400 dark:outline-red-500 focus:outline-red-500 dark:focus:outline-red-400";

const LABEL_CLASSES =
  "block text-sm font-medium text-gray-900 dark:text-white mb-1.5";

const ERROR_TEXT_CLASSES = "mt-1.5 text-sm text-red-600 dark:text-red-400";

// ─────────────────────────────────────────────
// Workspace type options
// ─────────────────────────────────────────────

interface WorkspaceTypeOption {
  value: WorkspaceType;
  label: string;
  description: string;
  icon: LucideIcon;
}

const WORKSPACE_TYPE_OPTIONS: WorkspaceTypeOption[] = [
  {
    value: "personal",
    label: "Personal",
    description: "Just for you. No one else can be added.",
    icon: UserIcon,
  },
  {
    value: "internal",
    label: "Internal",
    description: "Visible to you and the team members you invite.",
    icon: Building2Icon,
  },
  {
    value: "partner",
    label: "Partner",
    description: "Shared with your team plus invited external partners.",
    icon: HandshakeIcon,
  },
  {
    value: "public",
    label: "Public",
    description: "Visible to anyone — anyone can find and view it.",
    icon: GlobeIcon,
  },
];

interface WorkspaceTypeSelectorProps {
  value: WorkspaceType;
  onChange: (value: WorkspaceType) => void;
  error?: boolean;
}

const WorkspaceTypeSelector: FC<WorkspaceTypeSelectorProps> = ({
  value,
  onChange,
  error,
}) => {
  return (
    <div
      role="radiogroup"
      aria-label="Workspace type"
      className="grid grid-cols-2 sm:grid-cols-4 gap-3"
    >
      {WORKSPACE_TYPE_OPTIONS.map((option) => {
        const isSelected = value === option.value;
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(option.value)}
            className={[
              "flex flex-col items-start gap-2 rounded-lg border px-3.5 py-3 text-left transition-colors cursor-pointer",
              "focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500",
              isSelected
                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-400"
                : error
                  ? "border-red-400 dark:border-red-500 bg-white dark:bg-gray-800"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600",
            ].join(" ")}
          >
            <div
              className={[
                "flex h-8 w-8 items-center justify-center rounded-md",
                isSelected
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400",
              ].join(" ")}
            >
              <Icon size={16} strokeWidth={2} />
            </div>
            <div>
              <p
                className={[
                  "text-sm font-semibold",
                  isSelected
                    ? "text-indigo-700 dark:text-indigo-300"
                    : "text-gray-900 dark:text-white",
                ].join(" ")}
              >
                {option.label}
              </p>
              <p className="mt-0.5 text-xs leading-snug text-gray-500 dark:text-gray-400">
                {option.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};

const CreateWorkspaceForm: FC<CreateWorkspaceFormProps> = ({
  onSubmit: onSubmitProp,
}) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateWorkspaceFormValues>({
    defaultValues: {
      workspaceName: "",
      workspaceType: "internal",
    },
    mode: "onBlur",
  });

  const selectedType = watch("workspaceType");

  const onSubmit: SubmitHandler<CreateWorkspaceFormValues> = async (data) => {
    try {
      // Replace with a real API call, e.g.:
      // await api.post("/workspaces", data);
      if (onSubmitProp) {
        await onSubmitProp(data);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 600));
        console.log("Create workspace payload:", data);
      }
      toast.success("Workspace created successfully.");
      reset();
    } catch (error: AxiosError | any) {
      if (error.response) {
        const message = error.response.data?.message || "Failed to create workspace.";
        toast.error(message);
      } else {
        toast.error("Failed to create workspace.");
      }
    }
  };

  return (
    <div className="py-4 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 min-h-screen transition-colors duration-300 relative overflow-hidden">
      <div className="mx-auto max-w-3xl px-6 py-4">
        <div className="flex items-start gap-3 mb-6">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
            <BlocksIcon size={18} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Create workspace
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Give your workspace a name. You can add people afterward from Teams.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grow space-y-5">
            {/* Workspace Name */}
            <div>
              <label htmlFor="workspace-name" className={LABEL_CLASSES}>
                Workspace name
              </label>
              <input
                id="workspace-name"
                type="text"
                autoComplete="on"
                aria-invalid={errors.workspaceName ? "true" : "false"}
                aria-describedby={
                  errors.workspaceName ? "workspace-name-error" : undefined
                }
                className={`${INPUT_CLASSES} ${errors.workspaceName ? INPUT_ERROR_CLASSES : ""
                  }`}
                placeholder="Workspace name"
                {...register("workspaceName", {
                  required: "Workspace name is required",
                  minLength: {
                    value: 3,
                    message: "Workspace name must be at least 3 characters",
                  },
                  maxLength: {
                    value: 50,
                    message: "Workspace name must be under 50 characters",
                  },
                })}
              />
              {errors.workspaceName && (
                <p id="workspace-name-error" className={ERROR_TEXT_CLASSES}>
                  {errors.workspaceName.message}
                </p>
              )}
            </div>

            {/* Workspace Type */}
            <div>
              <label className={LABEL_CLASSES}>Workspace type</label>
              <Controller
                name="workspaceType"
                control={control}
                rules={{ required: "Select a workspace type" }}
                render={({ field }) => (
                  <WorkspaceTypeSelector
                    value={field.value}
                    onChange={field.onChange}
                    error={!!errors.workspaceType}
                  />
                )}
              />
              {errors.workspaceType && (
                <p className={ERROR_TEXT_CLASSES}>
                  {errors.workspaceType.message}
                </p>
              )}
              {selectedType === "personal" && (
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                  Personal workspaces can't have members added later.
                </p>
              )}
              {selectedType !== "personal" && (
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                  You'll be able to invite people from the Teams page after creating this.
                </p>
              )}
            </div>
          </div>

          <div className="mt-7 flex items-center gap-3">
            <Button loading={isSubmitting} loadingText="Creating…" type="submit">
              Create Workspace
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateWorkspaceForm;