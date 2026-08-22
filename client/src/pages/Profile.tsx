import {
  User as UserIcon,
  Shield,
  Lock,
} from "lucide-react";
// import { useAuth } from "@/hooks/useAuth";
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
  // const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">

        {/* Page Title */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Account Settings
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your profile, account, and security preferences.
          </p>
        </div>

        {/* ── Horizontal Tab Bar (transparent, theme-matched) ── */}
        <div className="border-b border-gray-200 dark:border-gray-800">
          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar -mb-px">
            {sections.map((s) => {
              const Icon = s.icon;
              const isActive = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`relative flex items-center gap-2 px-3.5 sm:px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors duration-150 bg-transparent ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  <Icon className="size-4 shrink-0" />
                  {s.label}
                  <span
                    className={`absolute left-0 right-0 -bottom-px h-0.5 rounded-full bg-linear-to-r from-blue-600 to-purple-600 transition-opacity duration-150 ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </button>
              );
            })}
          </nav>
        </div>

        {/* ── Content ── */}
        <div className="pt-8">
          {activeSection === "profile" && <ProfileSection />}
          {activeSection === "account" && <AccountSection />}
          {activeSection === "password" && <PasswordSection />}
        </div>
      </div>
    </div>
  );
}