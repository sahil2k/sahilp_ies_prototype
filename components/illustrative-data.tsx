import { Info } from "lucide-react"
import { cn } from "@/lib/utils"

// Required on every screen or panel that shows figures (docs/design.md 7.4).
export function IllustrativeData({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-small whitespace-nowrap text-ink-muted",
        className
      )}
      title="Figures are fictional and for illustration only."
    >
      <Info aria-hidden className="size-3.5" />
      Illustrative data
    </span>
  )
}
