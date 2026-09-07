import { MembershipRole } from "@/types/team.type";

const STYLES: Record<MembershipRole, string> = {
  owner: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300",
  admin: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300",
  editor: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
  viewer: "bg-gray-100 text-gray-600 dark:bg-gray-700/40 dark:text-gray-300",
};

export default function RoleBadge({ role }: { role: MembershipRole }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${STYLES[role]}`}>
      {role}
    </span>
  );
}