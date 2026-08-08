import { Check, Loader2 } from "lucide-react";

// ─── Save Button ──────────────────────────────────────────────────────────────

export function SaveButton({
  isSubmitting,
  label = "Save Changes",
}: {
  isSubmitting: boolean;
  label?: string;
}) {
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-linear-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold shadow-md hover:shadow-lg hover:from-blue-500 hover:to-purple-500 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150"
    >
      {isSubmitting ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Check className="size-4" />
      )}
      {isSubmitting ? "Saving..." : label}
    </button>
  );
}

export default SaveButton;