import { bandLabel, confidenceBand } from "@/lib/confidence"
import { cn } from "@/lib/utils"

// The signature component (docs/design.md 8.2): words first, number second,
// monochrome segments, and an optional notch at the promotion threshold.
// Deliberately not coloured by action type.
export function ConfidenceMeter({
  value,
  threshold,
  compact = false,
  className,
}: {
  value: number
  threshold?: number
  compact?: boolean
  className?: string
}) {
  const segments = compact ? 5 : 10
  const step = 100 / segments
  const band = confidenceBand(value)

  const bar = (
    <span
      className={cn("relative flex", compact ? "w-16 gap-[2px]" : "w-40 gap-[2px]")}
      aria-hidden
    >
      {Array.from({ length: segments }, (_, i) => {
        const fill = Math.max(0, Math.min(1, (value - i * step) / step))
        return (
          <span
            key={i}
            className={cn(
              "relative flex-1 overflow-hidden rounded-[1px] bg-rule",
              compact ? "h-1" : "h-1.5"
            )}
          >
            <span
              className="absolute inset-y-0 left-0 bg-ink"
              style={{ width: `${fill * 100}%` }}
            />
          </span>
        )
      })}
      {threshold !== undefined && (
        <span
          title={`Promotion threshold: ${threshold}%`}
          className="absolute -top-1 -bottom-1 w-[2px] -translate-x-1/2 bg-ink"
          style={{ left: `${threshold}%` }}
        />
      )}
    </span>
  )

  const label = `${bandLabel[band]}, ${value}%`

  if (compact) {
    return (
      <span
        className={cn("inline-flex items-center gap-2", className)}
        title={label}
        role="img"
        aria-label={label}
      >
        {bar}
        <span className="tabular text-small text-ink">{value}%</span>
      </span>
    )
  }

  return (
    <span
      className={cn("inline-flex flex-wrap items-center gap-x-3 gap-y-1", className)}
      role="img"
      aria-label={
        threshold !== undefined
          ? `${label}. Promotion threshold ${threshold}%`
          : label
      }
    >
      <span className="text-body font-medium text-ink">{bandLabel[band]}</span>
      {bar}
      <span className="tabular text-small text-ink">{value}%</span>
    </span>
  )
}
