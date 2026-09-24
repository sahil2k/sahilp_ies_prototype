import { Waves } from "lucide-react"
import { cn } from "@/lib/utils"

// A third-party agent's own icon in the marketplace: a circle, not the
// product's own square mark (ProductMark), so an installed agent never
// reads as a built-in feature.
export function AgentMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-ink",
        className
      )}
    >
      <Waves className="size-4.5 text-white" strokeWidth={2.25} />
    </span>
  )
}
