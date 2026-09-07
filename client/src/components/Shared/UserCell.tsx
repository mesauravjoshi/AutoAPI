import { TeamUser } from "@/types/team.type";

export default function UserCell({ user, fallbackEmail }: { user?: TeamUser; fallbackEmail?: string }) {
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[11px] text-gray-400">
          ?
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">{fallbackEmail}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {user.picture ? (
        <img src={user.picture} alt={user.fullname} className="h-7 w-7 rounded-full object-cover" />
      ) : (
        <div className="h-7 w-7 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-[11px] font-medium text-indigo-700 dark:text-indigo-300">
          {user.fullname?.[0]?.toUpperCase()}
        </div>
      )}
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-tight">{user.fullname}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
      </div>
    </div>
  );
}