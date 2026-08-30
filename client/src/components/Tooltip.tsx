/**
 * Tooltip.tsx
 * A fully custom, accessible, shadcn/ui-inspired Tooltip component.
 * Zero external dependencies — only React, TypeScript, and Tailwind CSS.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

// ─────────────────────────────────────────────
// Types & Interfaces
// ─────────────────────────────────────────────

export type TooltipPlacement = "top" | "bottom" | "left" | "right";

export interface TooltipProps {
  /** Text or node shown inside the tooltip bubble */
  content: React.ReactNode;
  /** The element that triggers the tooltip */
  children: React.ReactElement;
  /** Preferred placement (will flip if near viewport edge) */
  placement?: TooltipPlacement;
  /** Delay in ms before tooltip appears */
  delayMs?: number;
  /** Render the arrow indicator */
  showArrow?: boolean;
  /** Disable the tooltip entirely */
  disabled?: boolean;
  /** Controlled open state */
  open?: boolean;
  /** Callback when open state changes (controlled mode) */
  onOpenChange?: (open: boolean) => void;
  /** Extra class names for the tooltip bubble */
  className?: string;
}

interface TooltipPosition {
  top: number;
  left: number;
  resolvedPlacement: TooltipPlacement;
}

// ─────────────────────────────────────────────
// Context (for future Tooltip.Provider pattern)
// ─────────────────────────────────────────────

interface TooltipContextValue {
  delayMs: number;
}

const TooltipContext = createContext<TooltipContextValue>({ delayMs: 100 });

export const TooltipProvider: React.FC<{
  delayMs?: number;
  children: React.ReactNode;
}> = ({ delayMs = 100, children }) => (
  <TooltipContext.Provider value={{ delayMs }}>
    {children}
  </TooltipContext.Provider>
);

// ─────────────────────────────────────────────
// useTooltip hook
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// Viewport-collision-aware position calculator
// ─────────────────────────────────────────────

const OFFSET = 10; // px gap between trigger and tooltip

function calculatePosition(
  triggerRect: DOMRect,
  tooltipRect: DOMRect,
  preferredPlacement: TooltipPlacement
): TooltipPosition {
  const { innerWidth: vw, innerHeight: vh } = window;
  const scroll = { x: window.scrollX, y: window.scrollY };

  type Candidate = { placement: TooltipPlacement; top: number; left: number };

  const candidates: Candidate[] = [
    {
      placement: "top",
      top: triggerRect.top + scroll.y - tooltipRect.height - OFFSET,
      left: triggerRect.left + scroll.x + triggerRect.width / 2 - tooltipRect.width / 2,
    },
    {
      placement: "bottom",
      top: triggerRect.bottom + scroll.y + OFFSET,
      left: triggerRect.left + scroll.x + triggerRect.width / 2 - tooltipRect.width / 2,
    },
    {
      placement: "left",
      top: triggerRect.top + scroll.y + triggerRect.height / 2 - tooltipRect.height / 2,
      left: triggerRect.left + scroll.x - tooltipRect.width - OFFSET,
    },
    {
      placement: "right",
      top: triggerRect.top + scroll.y + triggerRect.height / 2 - tooltipRect.height / 2,
      left: triggerRect.right + scroll.x + OFFSET,
    },
  ];

  const fits = (c: Candidate) =>
    c.top - scroll.y >= 0 &&
    c.top - scroll.y + tooltipRect.height <= vh &&
    c.left - scroll.x >= 0 &&
    c.left - scroll.x + tooltipRect.width <= vw;

  // Try preferred first, then cycle through others
  const order: TooltipPlacement[] = [
    preferredPlacement,
    ...["top", "bottom", "left", "right"].filter((p) => p !== preferredPlacement) as TooltipPlacement[],
  ];

  for (const p of order) {
    const c = candidates.find((c) => c.placement === p)!;
    if (fits(c)) return { top: c.top, left: c.left, resolvedPlacement: c.placement };
  }

  // Fallback: clamp preferred position to viewport
  const fallback = candidates.find((c) => c.placement === preferredPlacement)!;
  return {
    top: Math.max(scroll.y, Math.min(fallback.top, scroll.y + vh - tooltipRect.height)),
    left: Math.max(scroll.x, Math.min(fallback.left, scroll.x + vw - tooltipRect.width)),
    resolvedPlacement: preferredPlacement,
  };
}

// ─────────────────────────────────────────────
// Arrow component
// ─────────────────────────────────────────────

const arrowClasses: Record<TooltipPlacement, string> = {
  top: "bottom-[-5px] left-1/2 -translate-x-1/2 border-t-[5px] border-t-zinc-800 dark:border-t-zinc-100 border-x-[5px] border-x-transparent border-b-0",
  bottom: "top-[-5px] left-1/2 -translate-x-1/2 border-b-[5px] border-b-zinc-800 dark:border-b-zinc-100 border-x-[5px] border-x-transparent border-t-0",
  left: "right-[-5px] top-1/2 -translate-y-1/2 border-l-[5px] border-l-zinc-800 dark:border-l-zinc-100 border-y-[5px] border-y-transparent border-r-0",
  right: "left-[-5px] top-1/2 -translate-y-1/2 border-r-[5px] border-r-zinc-800 dark:border-r-zinc-100 border-y-[5px] border-y-transparent border-l-0",
};

const Arrow = React.memo(({ placement }: { placement: TooltipPlacement }) => (
  <span
    aria-hidden="true"
    className={`absolute w-0 h-0 border-solid ${arrowClasses[placement]}`}
  />
));
Arrow.displayName = "TooltipArrow";

// ─────────────────────────────────────────────
// Tooltip Bubble
// ─────────────────────────────────────────────

interface BubbleProps {
  id: string;
  content: React.ReactNode;
  isOpen: boolean;
  showArrow: boolean;
  placement: TooltipPlacement;
  position: TooltipPosition | null;
  bubbleRef: React.RefObject<HTMLDivElement | null>;
  className?: string;
}

const TooltipBubble = React.memo(
  ({ id, content, isOpen, showArrow, placement, position, bubbleRef, className }: BubbleProps) => {
    const resolvedPlacement = position?.resolvedPlacement ?? placement;

    const originClass: Record<TooltipPlacement, string> = {
      top: "origin-bottom",
      bottom: "origin-top",
      left: "origin-right",
      right: "origin-left",
    };

    return (
      <div
        ref={bubbleRef}
        id={id}
        role="tooltip"
        style={
          position
            ? { position: "fixed", top: position.top, left: position.left }
            : { position: "fixed", visibility: "hidden", top: 0, left: 0 }
        }
        className={[
          // Layout
          "z-50 max-w-xs px-3 py-1.5 pointer-events-none",
          // Shape & color
          "rounded-md border border-zinc-700/60 dark:border-zinc-200/20",
          "dark:bg-zinc-800 bg-zinc-50",
          "dark:text-zinc-100 text-zinc-800",
          "text-xs font-medium leading-snug tracking-wide",
          // Shadow
          "shadow-md shadow-black/20 dark:shadow-black/10",
          // Animation
          "transition-all duration-150 ease-out",
          originClass[resolvedPlacement],
          isOpen && position
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        aria-hidden={!isOpen}
      >
        {content}
        {showArrow && <Arrow placement={resolvedPlacement} />}
      </div>
    );
  }
);
TooltipBubble.displayName = "TooltipBubble";

// ─────────────────────────────────────────────
// Main Tooltip component
// ─────────────────────────────────────────────

export const Tooltip = React.memo(function Tooltip({
  content,
  children,
  placement = "top",
  delayMs: propDelay,
  showArrow = true,
  disabled = false,
  open: controlledOpen,
  onOpenChange,
  className,
}: TooltipProps) {
  const ctx = useContext(TooltipContext);
  const delayMs = propDelay ?? ctx.delayMs;

  const uid = useId();
  const tooltipId = `tooltip-${uid}`;

  const triggerRef = useRef<HTMLElement | null>(null);
  const bubbleRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<TooltipPosition | null>(null);

  const { isOpen, show, hide } = useTooltip({
    delayMs,
    open: controlledOpen,
    onOpenChange,
    disabled,
  });

  // Recalculate position whenever open state or placement changes
  useEffect(() => {
    if (!isOpen) {
      // Small delay to let fade-out animation finish before clearing position
      const t = setTimeout(() => setPosition(null), 200);
      return () => clearTimeout(t);
    }

    const trigger = triggerRef.current;
    const bubble = bubbleRef.current;
    if (!trigger || !bubble) return;

    const measure = () => {
      const triggerRect = trigger.getBoundingClientRect();
      const bubbleRect = bubble.getBoundingClientRect();
      setPosition(calculatePosition(triggerRect, bubbleRect, placement));
    };

    // First render: bubble has no real size, defer one frame
    requestAnimationFrame(measure);

    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [isOpen, placement]);

  // Clone child to inject accessibility + event props
  const child = React.Children.only(children) as React.ReactElement<
    React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> }
  >;

  const triggerProps = useMemo(
    () => ({
      ref: (node: HTMLElement | null) => {
        (triggerRef as React.MutableRefObject<HTMLElement | null>).current = node;
        // Forward the original ref if present
        const originalRef = (child as any).ref;
        if (typeof originalRef === "function") originalRef(node);
        else if (originalRef && "current" in originalRef)
          (originalRef as React.MutableRefObject<HTMLElement | null>).current = node;
      },
      "aria-describedby": isOpen ? tooltipId : undefined,
      onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
        show();
        child.props.onMouseEnter?.(e);
      },
      onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
        hide();
        child.props.onMouseLeave?.(e);
      },
      onFocus: (e: React.FocusEvent<HTMLElement>) => {
        show();
        child.props.onFocus?.(e);
      },
      onBlur: (e: React.FocusEvent<HTMLElement>) => {
        hide();
        child.props.onBlur?.(e);
      },
    }),
    [child, isOpen, tooltipId, show, hide]
  );

  const trigger = React.cloneElement(child, triggerProps);

  return (
    <>
      {trigger}
      <TooltipBubble
        id={tooltipId}
        content={content}
        isOpen={isOpen}
        showArrow={showArrow}
        placement={placement}
        position={position}
        bubbleRef={bubbleRef}
        className={className}
      />
    </>
  );
});

Tooltip.displayName = "Tooltip";

export default Tooltip;