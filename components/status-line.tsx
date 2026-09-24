import { cn } from "@/lib/utils"

// In-product status line under a page title, e.g.
// "6 entities | 15 open exceptions | Readiness 78/100". Items are separated by
// hairline rules rather than punctuation. Every item carries a rule on its
// left, and the list is shifted left and clipped, so whichever item starts a
// row (after wrapping) never shows a stray leading rule.
export function StatusLine({
  items,
  className,
}: {
  items: React.ReactNode[]
  className?: string
}) {
  return (
    <div className={cn("overflow-hidden", className)}>
      <ul className="-ml-[13px] flex flex-wrap items-center gap-y-1 text-body text-ink-muted">
        {items.map((item, i) => (
          <li key={i} className="tabular border-l border-rule px-3">
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
