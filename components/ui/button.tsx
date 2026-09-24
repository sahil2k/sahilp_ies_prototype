import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Variants follow docs/design.md section 7.3. Use buttonVariants() on a
// next/link <Link> when the action navigates.
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-control border text-body font-medium whitespace-nowrap transition-colors select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary:
          "border-primary bg-primary text-primary-foreground hover:border-primary-hover hover:bg-primary-hover",
        secondary:
          "border-rule-strong bg-surface text-ink hover:bg-row-hover",
        quiet:
          "border-transparent bg-transparent px-0 text-ink underline underline-offset-4 hover:decoration-2",
        destructive:
          "border-negative bg-surface text-negative hover:bg-negative-tint",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-3 text-small",
      },
    },
    compoundVariants: [{ variant: "quiet", className: "px-0" }],
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "primary",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
