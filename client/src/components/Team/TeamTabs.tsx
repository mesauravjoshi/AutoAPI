type Tab = "members" | "invites" | "requests";

const TABS: { key: Tab; label: string }[] = [
  { key: "members", label: "Members" },
  { key: "invites", label: "Invite" },
  { key: "requests", label: "Requests" },
];

export default function TeamTabs({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <div className="flex items-center gap-1 border-b border-gray-200 dark:border-gray-800 mb-4">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            active === tab.key
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}