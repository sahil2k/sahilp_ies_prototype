import { CheckCheck, PenLine, UserRound } from "lucide-react"
import type { ActionType } from "@/data/company"
import { cn } from "@/lib/utils"

// The one badge for AI action types (docs/design.md 3.2). Never restyle or
// rename these per screen. Fill level encodes autonomy: solid = Automated,
// tinted = Assisted, outlined = Human handoff.
export const actionTypes: Record<
  ActionType,
  { label: string; icon: typeof CheckCheck; className: string }
> = {
  automated: {
    label: "Automated",
    icon: CheckCheck,
    className: "border-automated bg-automated text-white",
  },
  assisted: {
    label: "Assisted",
    icon: PenLine,
    className: "border-assisted-border bg-assisted-tint text-assisted",
  },
  handoff: {
    label: "Human handoff",
    icon: UserRound,
    className: "border-handoff-border bg-surface text-handoff",
  },
}

export function ActionBadge({
  type,
  className,
}: {
  type: ActionType
  className?: string
}) {
  const { label, icon: Icon, className: typeClass } = actionTypes[type]
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-control border px-2 text-badge whitespace-nowrap",
        typeClass,
        className
      )}
    >
      <Icon aria-hidden className="size-3.5" strokeWidth={2.25} />
      {label}
    </span>
  )
}
