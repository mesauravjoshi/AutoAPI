import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import {
  Menu as Bars3Icon,
  Bell as BellIcon,
  ChevronDown as ChevronDownIcon,
  LogOut as LogOutIcon,
  Home as HomeIcon,
  LayoutGrid as WorkspaceIcon,
  User as UserIcon,
} from "lucide-react";
import { useState } from "react";
// import { AuthContext } from '@/Context/AuthContext';
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { logoutService } from "@/services/authService";
import { WorkspaceModal } from "@/components/Workspace/WorkspaceModal";
import { SignOutModal } from "@/components/Auth/SignOutModal";

interface UserNavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<React.ComponentProps<"svg">>;
}

interface NavBarProps {
  // sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const userNavigation: UserNavigationItem[] = [
  { name: "Your profile", href: "/profile", icon: UserIcon },
];

// Material Design "filled tonal button" pill style — used for Home / Workspace
const MD_TONAL_BUTTON =
  "inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 active:bg-blue-200/70 dark:active:bg-blue-900/70 transition-colors duration-200 cursor-pointer";

export const NavBar = ({ setSidebarOpen }: NavBarProps) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const username = user?.username;
  // const email = user?.email;

  const handleSignOut = async () => {
    try {
      const response = await logoutService();
      // console.log(response);
      if (response.data) {
        logout();
        navigate(`/`)
      }
    } catch (error) {
      console.error(error);
    }
  };

  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  return (
    <div className="sticky top-0 z-40 flex h-12 shrink-0 items-center gap-x-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 shadow-xs sm:gap-x-6 sm:px-6 lg:px-8 transition-colors duration-300">
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-300 lg:hidden hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3Icon aria-hidden="true" className="size-6" />
      </button>

      {/* Separator */}
      <div
        aria-hidden="true"
        className="h-6 w-px bg-gray-300 dark:bg-gray-700 lg:hidden"
      />

      <div className="flex flex-1 min-w-0 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1 min-w-0 items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar">
          <Link to="/" className={MD_TONAL_BUTTON}>
            <HomeIcon className="size-3.5 sm:size-4" aria-hidden="true" />
            Home
          </Link>
          <button
            type="button"
            onClick={() => setWorkspaceOpen(true)}
            className={MD_TONAL_BUTTON}
          >
            <WorkspaceIcon className="size-3.5 sm:size-4" aria-hidden="true" />
            Workspace
          </button>
        </div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
          >
            <span className="sr-only">View notifications</span>
            <BellIcon aria-hidden="true" className="size-6" />
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none shadow-sm cursor-pointer"
            aria-label="Toggle dark mode"
          >
            {theme === "dark" ? (
              <svg
                className="w-5 h-5 text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-gray-700 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>

          {/* Separator */}
          <div
            aria-hidden="true"
            className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-300 dark:lg:bg-gray-700"
          />

          {/* Profile dropdown */}
          <Menu as="div" className="relative">
            <MenuButton className="-m-1.5 flex items-center p-1.5 focus:outline-none">
              <span className="sr-only">Open user menu</span>
              <img
                alt="profile img"
                src={
                  user?.picture || `https://ui-avatars.com/api/?name=${username || 'User'}&background=random&color=fff&size=128`
                }
                className="size-8 rounded-full bg-gray-100 dark:bg-gray-800 ring-2 ring-gray-200 dark:ring-gray-700"
              />

              <span className="hidden lg:flex lg:items-center">
                <span
                  aria-hidden="true"
                  className="ml-4 text-sm/6 font-semibold text-gray-900 dark:text-gray-100"
                >
                  {username}
                </span>
                <ChevronDownIcon
                  aria-hidden="true"
                  className="ml-2 size-5 text-gray-400 dark:text-gray-500"
                />
              </span>
            </MenuButton>
            <MenuItems
              transition
              className="absolute right-0 z-10 mt-2.5 w-40 origin-top-right rounded-md bg-white dark:bg-gray-800 py-2 shadow-lg ring-1 ring-gray-900/10 dark:ring-gray-700 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
            >
              {userNavigation.map((item) => (
                <MenuItem key={item.name}>
                  <Link
                    to={item.href}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm/6 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <item.icon className="size-4 text-gray-500 dark:text-gray-400" aria-hidden="true" />
                    {item.name}
                  </Link>
                </MenuItem>
              ))}

              <MenuItem>
                <button
                  onClick={() => setSignOutOpen(true)}
                  className="w-full text-left px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-sm font-medium transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <LogOutIcon className="size-4" />
                  Sign out
                </button>
              </MenuItem>
            </MenuItems>
          </Menu>
        </div>
      </div>

      <WorkspaceModal
        workspaceOpen={workspaceOpen}
        setWorkspaceOpen={setWorkspaceOpen}
      />
      <SignOutModal
        open={signOutOpen}
        onOpenChange={setSignOutOpen}
        onConfirm={handleSignOut}
      />
    </div>
  );
};