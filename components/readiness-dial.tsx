import { company } from "@/data/company"
import { cn } from "@/lib/utils"

// Close readiness (docs/design.md 8.5). The score gets its own accent colour
// and an instrument-style dial: a 270° ring of ticks that fill in readiness
// green, the score large in the middle, and a soft outer band marking the
// close-out target as a zone, not a single line. It shares the segmented
// language of the confidence meter, so the two read as one system.

const SWEEP = 270
const START = 135 // degrees, measured clockwise from 3 o'clock; gap at the bottom
// 41 ticks = one every 2.5 points (6.75°), so round targets such as 95 land
// exactly on a tick instead of between two.
const TICKS = 41
const STEP = 100 / (TICKS - 1)

// Rounded to 2 decimals: the server and the browser can disagree in the last
// digit of Math.cos/sin, which would cause a hydration mismatch.
const round = (n: number) => Math.round(n * 100) / 100

function point(angle: number, r: number) {
  const rad = (angle * Math.PI) / 180
  return { x: round(100 + r * Math.cos(rad)), y: round(100 + r * Math.sin(rad)) }
}

// A single open arc at one radius, for a stroked band with round caps at
// both ends. Kept clear of the tick tips (its own separate radius, not
// overlapping) and capped like the ticks, so it never meets them at a hard
// corner.
function arcPath(startAngle: number, endAngle: number, r: number) {
  const a = point(startAngle, r)
  const b = point(endAngle, r)
  return `M ${a.x} ${a.y} A ${r} ${r} 0 0 1 ${b.x} ${b.y}`
}

export function ReadinessDial({
  value,
  target = company.readinessTarget,
  className,
}: {
  value: number
  target?: number
  className?: string
}) {
  const toGo = Math.max(0, target - value)
  const targetAngle = START + (SWEEP * target) / 100
  const endAngle = START + SWEEP

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div
        role="img"
        aria-label={`Close readiness ${value} out of 100. Ready-to-close zone starts at ${target}.`}
        className="relative aspect-square w-[184px] shrink-0"
      >
        <svg viewBox="0 0 200 200" className="size-full" aria-hidden>
          <path
            d={arcPath(targetAngle, endAngle, 97)}
            fill="none"
            strokeWidth={5}
            strokeLinecap="round"
            className="stroke-readiness/30"
          />
          {Array.from({ length: TICKS }, (_, i) => {
            const tickValue = i * STEP
            const angle = START + (SWEEP * i) / (TICKS - 1)
            const a = point(angle, 74)
            const b = point(angle, 90)
            return (
              <line
                key={i}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                strokeWidth={4}
                strokeLinecap="round"
                className={cn(
                  "transition-[stroke] duration-150",
                  tickValue <= value ? "stroke-readiness" : "stroke-readiness-track"
                )}
              />
            )
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="tabular text-[52px] leading-none font-semibold tracking-[-0.02em] text-readiness-strong">
            {value}
          </span>
          <span className="mt-1 text-small text-ink-muted">of 100</span>
        </div>
        <span className="absolute inset-x-0 bottom-1 text-center text-small text-ink-muted">
          {toGo > 0 ? `${toGo} to target ${target}` : "Ready to close"}
        </span>
      </div>
      <span className="flex items-center gap-1.5 text-small text-readiness-strong">
        <span aria-hidden className="h-1 w-3 rounded-full bg-readiness/30" />
        Ready zone, {target}+
      </span>
    </div>
  )
}

// Compact ring for tables and status lines: a thin progress ring plus the
// score in readiness green.
export function ReadinessMini({
  value,
  label,
  className,
}: {
  value: number
  label?: string
  className?: string
}) {
  const r = 7
  const c = 2 * Math.PI * r
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 align-middle", className)}
      title={`Close readiness ${value} out of 100`}
    >
      <svg viewBox="0 0 20 20" className="size-[18px] shrink-0 -rotate-90" aria-hidden>
        <circle cx="10" cy="10" r={r} fill="none" strokeWidth="3" className="stroke-readiness-track" />
        <circle
          cx="10"
          cy="10"
          r={r}
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${(c * value) / 100} ${c}`}
          className="stroke-readiness transition-[stroke-dasharray] duration-500"
        />
      </svg>
      <span className="tabular font-semibold text-readiness-strong">
        {label ? `${label} ` : ""}
        {value}
      </span>
    </span>
  )
}
