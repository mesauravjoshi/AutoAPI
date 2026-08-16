import type React from "react";

interface CheckboxProps {
  label?: string;
  checked: boolean;
  className?: string;
  id?: string;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  id,
  onChange,
  className = "",
  disabled = false,
}) => {
  return (
    <label
      htmlFor={id}
      className={`group flex items-center gap-2.5 select-none ${
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
      }`}
    >
      <div className="relative flex h-5 w-5 shrink-0 items-center justify-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className={`h-5 w-5 cursor-pointer appearance-none rounded-md border transition-colors duration-150
            border-gray-300 bg-white
            checked:border-transparent checked:bg-[#465FFF]
            group-hover:border-gray-400
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#465FFF]/30 focus-visible:ring-offset-1
            disabled:cursor-not-allowed disabled:bg-gray-100 disabled:checked:bg-gray-300
            dark:border-gray-700 dark:bg-transparent
            dark:group-hover:border-gray-600
            dark:disabled:bg-white/4 dark:disabled:checked:bg-gray-600
            ${className}`}
        />
        {checked && (
          <svg
            className={`pointer-events-none absolute h-3.5 w-3.5 ${
              disabled ? "text-gray-200 dark:text-gray-400" : "text-white"
            }`}
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      {label && (
        <span
          className={`text-sm font-medium transition-colors duration-150 ${
            checked
              ? "text-gray-800 dark:text-white"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {label}
        </span>
      )}
    </label>
  );
};

export default Checkbox;