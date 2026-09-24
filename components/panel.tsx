import type { ActionType } from "@/data/company"
import { cn } from "@/lib/utils"
import { ActionBadge } from "./action-badge"

const accentBorder: Record<ActionType, string> = {
  automated: "border-l-automated",
  assisted: "border-l-assisted",
  handoff: "border-l-handoff",
}

// Bordered panel (docs/design.md 7.1). An AI-produced panel passes `aiType`,
// which adds the 3px left border in its action hue and the badge in the header.
export function Panel({
  title,
  aside,
  aiType,
  className,
  bodyClassName,
  children,
  id,
}: {
  title?: React.ReactNode
  aside?: React.ReactNode
  aiType?: ActionType
  className?: string
  bodyClassName?: string
  children: React.ReactNode
  id?: string
}) {
  return (
    <section
      id={id}
      className={cn(
        "rounded-panel border border-rule bg-surface",
        aiType && ["border-l-[3px]", accentBorder[aiType]],
        className
      )}
    >
      {(title || aside || aiType) && (
        <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-rule px-4 py-3 md:px-6">
          <div className="flex flex-wrap items-center gap-3">
            {title && <h2 className="text-h3 text-ink">{title}</h2>}
            {aiType && <ActionBadge type={aiType} />}
          </div>
          {aside}
        </header>
      )}
      <div className={cn("p-4 md:p-6", bodyClassName)}>{children}</div>
    </section>
  )
}
