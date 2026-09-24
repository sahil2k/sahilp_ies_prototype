import { CircleCheck, CircleX, Info, TriangleAlert } from "lucide-react"
import { cn } from "@/lib/utils"

// Inline confirmation / warning / error strip (docs/design.md 3.3).
const tones = {
  success: { icon: CircleCheck, className: "border-l-positive text-ink", iconClass: "text-positive" },
  info: { icon: Info, className: "border-l-ink-muted text-ink", iconClass: "text-ink-muted" },
  warning: {
    icon: TriangleAlert,
    className: "border-l-warning bg-warning-tint text-warning font-semibold",
    iconClass: "text-warning",
  },
  error: { icon: CircleX, className: "border-l-negative bg-negative-tint text-negative", iconClass: "text-negative" },
}

export function StatusNote({
  tone,
  children,
  className,
}: {
  tone: keyof typeof tones
  children: React.ReactNode
  className?: string
}) {
  const { icon: Icon, className: toneClass, iconClass } = tones[tone]
  return (
    <div
      role="status"
      className={cn(
        "flex gap-3 rounded-control border border-l-[3px] border-rule bg-surface px-4 py-3 text-body",
        toneClass,
        className
      )}
    >
      <Icon aria-hidden className={cn("mt-[3px] size-4 shrink-0", iconClass)} />
      <div className="flex flex-1 flex-col gap-1">{children}</div>
    </div>
  )
}
