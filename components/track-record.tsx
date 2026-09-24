import type { AccuracyMonth } from "@/data/company"
import { accuracy, monthName } from "@/lib/confidence"
import { cn } from "@/lib/utils"

// Earned Autonomy track record (docs/design.md 8.4): one cell per month,
// filled when that month met the promotion threshold. `marked` outlines one
// month in the warning colour, e.g. the month an Automated task made a miss.
export function TrackRecord({
  history,
  threshold,
  marked,
}: {
  history: AccuracyMonth[]
  threshold: number
  marked?: { month: string; label: string }
}) {
  return (
    <ol className="grid grid-cols-6 gap-1.5" aria-label="Monthly accuracy">
      {history.map((m) => {
        const rate = accuracy(m)
        const met = rate >= threshold
        const flag = marked?.month === m.month
        return (
          <li key={m.month} className="flex flex-col gap-1">
            <span
              className={cn(
                "flex h-9 items-center justify-center rounded-control border text-small tabular",
                met
                  ? "border-ink bg-ink text-white"
                  : "border-rule-strong bg-surface text-ink",
                flag && "outline-2 outline-offset-2 outline-warning"
              )}
              title={`${monthName(m.month, "long")}: ${m.correct} of ${m.proposed} correct`}
            >
              {rate === 100 ? "100" : rate.toFixed(1)}%
            </span>
            <span className="text-center text-small text-ink-muted">
              {monthName(m.month)}
              <span className="sr-only">{met ? ", met threshold" : ", below threshold"}</span>
            </span>
            {flag && (
              <span className="text-center text-small font-semibold text-warning">
                {marked.label}
              </span>
            )}
          </li>
        )
      })}
    </ol>
  )
}
