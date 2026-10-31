import * as React from "react"
import { type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { Loader2Icon } from "lucide-react"

import { cn } from "@/lib/utils"
import buttonVariants from "@/components/UI/buttonVariant"

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  loading = false,
  loadingText,
  disabled,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    /** Shows a spinner and disables the button while a request is in flight. */
    loading?: boolean
    /** Optional label to swap in next to the spinner, e.g. "Creating…" */
    loadingText?: React.ReactNode
  }) {
  const Comp = asChild ? Slot.Root : "button"
  const isDisabled = disabled || loading

  // asChild renders a single arbitrary child (e.g. a Link), so we can't
  // safely inject a spinner alongside its content — just disable/mark it.
  if (asChild) {
    return (
      <Comp
        data-slot="button"
        data-variant={variant}
        data-size={size}
        data-loading={loading || undefined}
        aria-busy={loading || undefined}
        aria-disabled={isDisabled || undefined}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </Comp>
    )
  }

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-loading={loading || undefined}
      aria-busy={loading || undefined}
      disabled={isDisabled}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {loading && <Loader2Icon className="animate-spin" />}
      {loading && loadingText !== undefined ? loadingText : children}
    </Comp>
  )
}

export { Button }