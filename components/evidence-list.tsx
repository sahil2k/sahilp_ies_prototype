import { Check, FileText, X } from "lucide-react"
import type { Evidence } from "@/data/company"

// "Why this?" evidence (docs/design.md 8.3): sources, then checks passed/failed.
export function EvidenceList({ items }: { items: Evidence[] }) {
  const sources = items.filter((e) => e.passed === null)
  const checks = items.filter((e) => e.passed !== null)
  return (
    <div className="flex flex-col gap-4">
      {sources.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-small font-medium text-ink-muted">Sources</h3>
          <ul className="flex flex-col gap-1.5">
            {sources.map((e) => (
              <li key={e.label} className="flex gap-2 text-body text-ink">
                <FileText aria-hidden className="mt-[3px] size-4 shrink-0 text-ink-muted" />
                <span className="tabular">{e.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {checks.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-small font-medium text-ink-muted">Checks</h3>
          <ul className="flex flex-col gap-1.5">
            {checks.map((e) => (
              <li key={e.label} className="flex gap-2 text-body text-ink">
                {e.passed ? (
                  <Check aria-hidden className="mt-[3px] size-4 shrink-0 text-positive" />
                ) : (
                  <X aria-hidden className="mt-[3px] size-4 shrink-0 text-warning" />
                )}
                <span className={e.passed ? "" : "font-semibold text-warning"}>
                  <span className="sr-only">{e.passed ? "Passed: " : "Did not pass: "}</span>
                  {e.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
