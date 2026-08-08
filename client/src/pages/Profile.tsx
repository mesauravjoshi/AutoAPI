import {
  User as UserIcon,
  Shield,
  ChevronRight,
  Lock,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import ProfileSection from "@/components/Profile/ProfileSection";
import AccountSection from "@/components/Profile/Accountsection ";
import PasswordSection from "@/components/Profile/Passwo";
import { useState } from "react";

// ─── Section IDs ─────────────────────────────────────────────────────────────

type Section = "profile" | "account" | "password";

const sections = [
  { id: "profile" as Section, label: "Profile", icon: UserIcon },
  { id: "account" as Section, label: "Account", icon: Shield },
  { id: "password" as Section, label: "Password", icon: Lock },
];

// ─── Main Profile Page ────────────────────────────────────────────────────────
export default function Profile() {
  const [activeSection, setActiveSection] = useState<Section>("profile");
  const { user } = useAuth();

  const avatarUrl =
    user?.picture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.firstname || user?.username || "User"
    )}&background=6366f1&color=fff&size=128&bold=true`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <img
              src={avatarUrl}
              alt="avatar"
              className="size-12 rounded-full ring-2 ring-gray-200 dark:ring-gray-700 shadow-sm"
            />
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                {user?.fullname || user?.firstname || user?.username}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                @{user?.username} · {user?.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Sidebar Nav ── */}
          <aside className="lg:w-52 shrink-0">
            <nav className="lg:sticky lg:top-6 space-y-1">
              {sections.map((s) => {
                const Icon = s.icon;
                const isActive = activeSection === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveSection(s.id)}
                    className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${isActive
                      ? "bg-linear-to-r from-blue-600 to-purple-600 text-white shadow-md shadow-indigo-500/20"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
                      }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className="size-4 shrink-0" />
                      {s.label}
                    </span>
                    <ChevronRight
                      className={`size-3.5 shrink-0 transition-transform ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-50"
                        }`}
                    />
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* ── Content ── */}
          <div className="flex-1 min-w-0">
            {activeSection === "profile" && <ProfileSection />}
            {activeSection === "account" && <AccountSection />}
            {activeSection === "password" && <PasswordSection />}
          </div>
        </div>
      </div>
    </div>
  );
}
