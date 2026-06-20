import {
  type FC,
} from "react";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import UserMultiSelect from "@/components/Common/MultiSelect";

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface CreateWorkspaceFormValues {
  workspaceName: string;
  users: string[]; // array of selected user ids
}

export interface CreateWorkspaceFormProps {
  /** List of users to populate the searchable dropdown. */
  users?: User[];
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

const CreateWorkspaceForm: FC<CreateWorkspaceFormProps> = ({
  users,
  onSubmit: onSubmitProp,
}) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<CreateWorkspaceFormValues>({
    defaultValues: {
      workspaceName: "",
      users: [],
    },
    mode: "onBlur",
  });

  const onSubmit: SubmitHandler<CreateWorkspaceFormValues> = async (data) => {
    // Replace with a real API call, e.g.:
    // await api.post("/workspaces", data);
    if (onSubmitProp) {
      await onSubmitProp(data);
    } else {
      await new Promise((resolve) => setTimeout(resolve, 600));
      console.log("Create workspace payload:", data);
    }
    reset();
  };

  return (
    <div className="py-4 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 min-h-screen transition-colors duration-300 relative overflow-hidden">
      <div className="mx-auto py-4 max-w-lg">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Create workspace
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Give your workspace a name and add the people who'll use it.
          </p>
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

            {/* Users */}
            <div>
              <label htmlFor="workspace-users" className={LABEL_CLASSES}>
                Users
              </label>
              <Controller
                name="users"
                control={control}
                rules={{
                  validate: (value) =>
                    (value && value.length > 0) || "Select at least one user",
                }}
                render={({ field }) => (
                  <UserMultiSelect
                    id="workspace-users"
                    value={field.value}
                    onChange={field.onChange}
                    users={users ?? []}
                    error={!!errors.users}
                  />
                )}
              />
              {errors.users && (
                <p className={ERROR_TEXT_CLASSES}>{errors.users.message}</p>
              )}
            </div>
          </div>

          <div className="mt-7 flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center items-center rounded-md bg-indigo-600 dark:bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 dark:hover:bg-indigo-400 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-600 dark:focus:outline-indigo-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Creating…" : "Create Workspace"}
            </button>

            {isSubmitSuccessful && (
              <span className="text-sm text-green-600 dark:text-green-400">
                Workspace created.
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateWorkspaceForm;