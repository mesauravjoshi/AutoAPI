// ─────────────────────────────────────────────
// useTooltip hook
// ─────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from "react";

export function useTooltip({
  delayMs = 300,
  open: controlledOpen,
  onOpenChange,
  disabled = false,
}: {
  delayMs?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}) {
  const isControlled = controlledOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = useCallback(
    (val: boolean) => {
      if (disabled) return;
      if (!isControlled) setUncontrolledOpen(val);
      onOpenChange?.(val);
    },
    [disabled, isControlled, onOpenChange]
  );

  const show = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setOpen(true), delayMs);
  }, [delayMs, setOpen]);

  const hide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpen(false);
  }, [setOpen]);

  // Escape key closes tooltip
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") hide();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, hide]);

  // Clean up timer on unmount
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return { isOpen, show, hide };
}
