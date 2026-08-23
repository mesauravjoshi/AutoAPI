// CustomSelect.tsx
import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption<T extends string = string> {
  value: T;
  label?: string;   // defaults to value if omitted
  disabled?: boolean;
}

interface CustomSelectProps<T extends string = string> {
  options: (T | SelectOption<T>)[];
  value: T;
  onChange: (value: T) => void;

  placeholder?: string;
  disabled?: boolean;

  // ---- fully optional class overrides ----
  wrapperClassName?: string;       // outer relative container
  buttonClassName?: string;        // trigger button (base, always applied)
  buttonOpenClassName?: string;    // applied to button when dropdown is open
  buttonClosedClassName?: string;  // applied to button when dropdown is closed
  chevronClassName?: string;       // chevron icon
  dropdownClassName?: string;      // the floating options panel
  optionClassName?: string;        // each option (base, always applied)
  optionSelectedClassName?: string;// applied to the currently selected option
  optionUnselectedClassName?: string; // applied to non-selected options
  optionDisabledClassName?: string;   // applied to disabled options

  // escape hatches for full control
  renderTrigger?: (opts: { selected: SelectOption<T> | undefined; open: boolean }) => React.ReactNode;
  renderOption?: (opt: SelectOption<T>, isSelected: boolean) => React.ReactNode;
}

function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

function normalizeOptions<T extends string>(options: (T | SelectOption<T>)[]): SelectOption<T>[] {
  return options.map((o) => (typeof o === 'string' ? { value: o } : o));
}

// ---- default theme (same look everywhere unless overridden via props) ----
const DEFAULT_BUTTON_CLASSNAME =
  'rounded-md border px-3 py-2 text-sm font-medium transition-all duration-150';
const DEFAULT_BUTTON_CLOSED_CLASSNAME =
  'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-gray-400 dark:hover:border-gray-500';
const DEFAULT_BUTTON_OPEN_CLASSNAME =
  'border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-600 dark:text-indigo-300';
const DEFAULT_CHEVRON_CLASSNAME = 'text-gray-400';
const DEFAULT_DROPDOWN_CLASSNAME =
  'top-11 left-0 w-44 rounded-md bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 py-1 overflow-hidden';
const DEFAULT_OPTION_CLASSNAME = 'px-3 py-2 text-sm cursor-pointer transition-colors duration-100';
const DEFAULT_OPTION_SELECTED_CLASSNAME = 'bg-indigo-600 text-white';
const DEFAULT_OPTION_UNSELECTED_CLASSNAME =
  'text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-gray-700';
const DEFAULT_OPTION_DISABLED_CLASSNAME = 'opacity-50 cursor-not-allowed';

export default function CustomSelect<T extends string = string>({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false,

  wrapperClassName = '',
  buttonClassName = DEFAULT_BUTTON_CLASSNAME,
  buttonOpenClassName = DEFAULT_BUTTON_OPEN_CLASSNAME,
  buttonClosedClassName = DEFAULT_BUTTON_CLOSED_CLASSNAME,
  chevronClassName = DEFAULT_CHEVRON_CLASSNAME,
  dropdownClassName = DEFAULT_DROPDOWN_CLASSNAME,
  optionClassName = DEFAULT_OPTION_CLASSNAME,
  optionSelectedClassName = DEFAULT_OPTION_SELECTED_CLASSNAME,
  optionUnselectedClassName = DEFAULT_OPTION_UNSELECTED_CLASSNAME,
  optionDisabledClassName = DEFAULT_OPTION_DISABLED_CLASSNAME,

  renderTrigger,
  renderOption,
}: CustomSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const normalized = normalizeOptions(options);
  const selected = normalized.find((o) => o.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (opt: SelectOption<T>) => {
    if (opt.disabled) return;
    onChange(opt.value);
    setOpen(false);
  };

  return (
    <div className={classNames('relative', wrapperClassName)} ref={wrapperRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={classNames(
          'flex items-center justify-between cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
          buttonClassName,
          open ? buttonOpenClassName : buttonClosedClassName
        )}
      >
        {renderTrigger ? (
          renderTrigger({ selected, open })
        ) : (
          <>
            <span>{selected ? selected.label ?? selected.value : placeholder}</span>
            <ChevronDown
              size={14}
              className={classNames(
                'transition-transform duration-150',
                open ? 'rotate-180' : '',
                chevronClassName
              )}
            />
          </>
        )}
      </button>

      {open && (
        <div className={classNames('absolute z-50', dropdownClassName)}>
          {normalized.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                onClick={() => handleSelect(opt)}
                className={classNames(
                  optionClassName,
                  isSelected ? optionSelectedClassName : optionUnselectedClassName,
                  opt.disabled && optionDisabledClassName
                )}
              >
                {renderOption ? renderOption(opt, isSelected) : opt.label ?? opt.value}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}