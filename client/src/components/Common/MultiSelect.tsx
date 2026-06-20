import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type FC,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Mock data — replace with real data fetched from your API (e.g. via a
// useUsers() hook or props passed down from a parent container).
// ---------------------------------------------------------------------------


// Shared input styling — pulled directly from the base markup so every
// field in the form looks consistent.
const INPUT_CLASSES =
  "block w-full rounded-md bg-white dark:bg-gray-800 px-3 py-2.5 text-base text-gray-900 dark:text-white outline-1 -outline-offset-1 outline-gray-300 dark:outline-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 dark:focus:outline-indigo-400 sm:text-sm/6 transition-colors";

const INPUT_ERROR_CLASSES =
  "outline-red-400 dark:outline-red-500 focus:outline-red-500 dark:focus:outline-red-400";
  
// ---------------------------------------------------------------------------
// UsersMultiSelect
//
// A searchable, multi-select dropdown built from scratch (no extra
// dependencies). It exposes a single `value` / `onChange` pair so it can be
// wired into React Hook Form via <Controller>.
// ---------------------------------------------------------------------------
interface UsersMultiSelectProps {
  id: string;
  value: string[];
  onChange: (value: string[]) => void;
  users: User[];
  error?: boolean;
}

const UsersMultiSelect: FC<UsersMultiSelectProps> = ({
  id,
  value,
  onChange,
  users,
  error,
}) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedUsers = users.filter((u) => value.includes(u.id));

  const filteredUsers = users.filter((u) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  });

  // Close on outside click.
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleUser = useCallback(
    (userId: string) => {
      if (value.includes(userId)) {
        onChange(value.filter((id) => id !== userId));
      } else {
        onChange([...value, userId]);
      }
    },
    [value, onChange]
  );

  const removeUser = useCallback(
    (userId: string, event: ReactMouseEvent) => {
      event.stopPropagation();
      onChange(value.filter((id) => id !== userId));
    },
    [value, onChange]
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      setActiveIndex((prev) =>
        prev < filteredUsers.length - 1 ? prev + 1 : prev
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (isOpen && activeIndex >= 0 && filteredUsers[activeIndex]) {
        toggleUser(filteredUsers[activeIndex].id);
      }
    } else if (event.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
    } else if (event.key === "Backspace" && query === "" && value.length > 0) {
      // Quick-remove the last selected chip when backspacing on an empty input.
      onChange(value.slice(0, -1));
    }
  };

  // Keep the active option scrolled into view.
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const activeEl = listRef.current.children[activeIndex] as
      | HTMLElement
      | undefined;
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  return (
    <div ref={containerRef} className="relative">
      <div
        className={`${INPUT_CLASSES} ${error ? INPUT_ERROR_CLASSES : ""
          } cursor-text flex flex-wrap items-center gap-1.5 min-h-10.5 py-1.5`}
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
      >
        {selectedUsers.map((user) => (
          <span
            key={user.id}
            className="inline-flex items-center gap-1 rounded bg-indigo-50 dark:bg-indigo-500/10 pl-2 pr-1 py-0.5 text-sm text-indigo-700 dark:text-indigo-300"
          >
            {user.name}
            <button
              type="button"
              onClick={(event) => removeUser(user.id, event)}
              aria-label={`Remove ${user.name}`}
              className="rounded p-0.5 text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-200 focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-3.5 w-3.5"
              >
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={`${id}-listbox`}
          aria-autocomplete="list"
          autoComplete="off"
          className="flex-1 min-w-30 bg-transparent border-0 p-0.5 text-base text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-0 sm:text-sm/6"
          placeholder={selectedUsers.length === 0 ? "Search and select users" : ""}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {isOpen && (
        <ul
          id={`${id}-listbox`}
          role="listbox"
          ref={listRef}
          className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg outline-1 outline-gray-200 dark:outline-gray-700 sm:text-sm"
        >
          {filteredUsers.length === 0 ? (
            <li className="px-3 py-2 text-gray-500 dark:text-gray-400">
              No users found
            </li>
          ) : (
            filteredUsers.map((user, index) => {
              const isSelected = value.includes(user.id);
              const isActive = index === activeIndex;
              return (
                <li
                  key={user.id}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => toggleUser(user.id)}
                  className={`flex cursor-pointer items-center justify-between px-3 py-2 ${isActive ? "bg-indigo-50 dark:bg-indigo-500/10" : ""
                    }`}
                >
                  <span>
                    <span
                      className={`block ${isSelected
                        ? "font-medium text-gray-900 dark:text-white"
                        : "text-gray-700 dark:text-gray-200"
                        }`}
                    >
                      {user.name}
                    </span>
                    <span className="block text-xs text-gray-400 dark:text-gray-500">
                      {user.email}
                    </span>
                  </span>
                  {isSelected && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
};

export default UsersMultiSelect;