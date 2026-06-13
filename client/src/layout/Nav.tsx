import { useEffect } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Bars3Icon, BellIcon } from "@heroicons/react/24/outline";
import {
  ChevronDownIcon,
  // MagnifyingGlassIcon
} from "@heroicons/react/20/solid";
import axios from "axios";
import { useState } from "react";
// import { AuthContext } from '@/Context/AuthContext';
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { logoutService } from "@/services/authService";
import api from "@/lib/api";

interface UserNavigationItem {
  name: string;
  href: string;
}

interface NavBarProps {
  // sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const userNavigation: UserNavigationItem[] = [
  { name: "Your profile", href: "#" },
];

export const NavBar = ({ setSidebarOpen }: NavBarProps) => {
  const { theme, toggleTheme } = useTheme();
  const [gravatarUrl, setGravatarUrl] = useState("");
  const { user, logout } = useAuth();

  const username = user?.username;
  const email = user?.email;

  useEffect(() => {
    const generateGravatar = async () => {
      if (email) {
        try {
          const response = await axios.get(
            `https://api.hashify.net/hash/md5/hex?value=${email}`,
          );
          const hash = response.data?.Digest;
          if (hash) {
            // console.log(`https://www.gravatar.com/avatar/${hash}?d=identicon`);
            setGravatarUrl(
              `https://www.gravatar.com/avatar/${hash}?d=identicon`,
            );
          }
        } catch (error) {
          console.error("Failed to fetch MD5 hash for Gravatar:", error);
        }
      }
    };
    if (email) {
      // console.log('called');
      generateGravatar();
    }
  }, [email]);

  const handleSignOut = async () => {
    try {
      const response = await logoutService();
      // console.log(response);
      if (response.data) {
        logout();
      }
    } catch (error) {
      console.error(error);
    }
  };
  const payload = [
    {
      "name": "Get Users",
      "method": "GET",
      "url": "https://api.example.com/users",
      "collectionId": {
        "$oid": "69fa45710aab17d14a1c0861"
      }
    },
    {
      "name": "Create User",
      "method": "POST",
      "url": "https://api.example.com/users",
      "collectionId": {
        "$oid": "69fa45710aab17d14a1c0861"
      }
    },
    {
      "name": "Update User",
      "method": "PUT",
      "url": "https://api.example.com/users/1",
      "collectionId": {
        "$oid": "69fa45710aab17d14a1c0862"
      }
    },
    {
      "name": "Delete User",
      "method": "DELETE",
      "url": "https://api.example.com/users/1",
      "collectionId": {
        "$oid": "69fa45710aab17d14a1c0862"
      }
    }
  ]
  const handleAddWorkSpace = async () => {
    try {
      const response = await api.post("/request/bulk", payload);
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  };

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

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="grid flex-1 grid-cols-4 gap-4">
          <Link to={`/`}>
            <div
              className="text-center cursor-pointer rounded-md border border-gray-500 dark:border-gray-600 px-2 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 my-2"
            >
              Home
            </div>
          </Link>
          <div
            className="text-center cursor-pointer rounded-md border border-gray-500 dark:border-gray-600 px-2 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 my-2"
            onClick={() => handleAddWorkSpace()}
          >
            Workspace
          </div>
          {/* <input
            name="search"
            type="search"
            placeholder="Search"
            aria-label="Search"
            className="col-start-1 row-start-1 block size-full bg-white dark:bg-gray-900 pl-8 text-base text-gray-900 dark:text-gray-100 outline-hidden placeholder:text-gray-400 dark:placeholder:text-gray-500 sm:text-sm/6 border-0 focus:ring-0"
          />
          <MagnifyingGlassIcon
            aria-hidden="true"
            className="pointer-events-none col-start-1 row-start-1 size-5 self-center text-gray-400 dark:text-gray-500"
          /> */}
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
                  gravatarUrl || "https://www.gravatar.com/avatar/default?d=mp"
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
              className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white dark:bg-gray-800 py-2 shadow-lg ring-1 ring-gray-900/10 dark:ring-gray-700 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
            >
              {userNavigation.map((item) => (
                <MenuItem key={item.name}>
                  <Link
                    to={item.href}
                    className="block px-3 py-1 text-sm/6 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {item.name}
                  </Link>
                </MenuItem>
              ))}

              <MenuItem>
                <button
                  onClick={() => handleSignOut()}
                  className="w-full text-left px-3 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Sign out
                </button>
              </MenuItem>
            </MenuItems>
          </Menu>
        </div>
      </div>
    </div>
  );
};
