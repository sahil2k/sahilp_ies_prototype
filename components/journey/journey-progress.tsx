"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutGrid } from "lucide-react"
import { hubHref, journeys, stepHref, type JourneyId } from "@/data/journeys"
import { cn } from "@/lib/utils"

// Header navigation for a screen: a persistent link back to the hub, then
// "Step 2 of 5: Exception queue" and a segmented track. Each segment links to
// its screen. Nothing renders on the hub itself.
export function JourneyProgress({ journeyId }: { journeyId: JourneyId }) {
  const pathname = usePathname()
  const journey = journeys[journeyId]
  const total = journey.steps.length
  const current = journey.steps.findIndex(
    (s) => pathname === stepHref(journeyId, s.slug)
  )
  if (current === -1) return null

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
      <Link
        href={hubHref(journeyId)}
        className="inline-flex items-center gap-1.5 self-start text-small text-ink underline underline-offset-4 sm:self-auto"
      >
        <LayoutGrid aria-hidden className="size-3.5" />
        {journey.hubLabel}
      </Link>
      <nav
        aria-label={`${journey.hubTitle} screens`}
        className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4"
      >
        <p className="text-small text-ink-muted">
          Step {current + 1} of {total}:{" "}
          <span className="font-medium text-ink">{journey.steps[current].title}</span>
        </p>
        <ol className="flex gap-1 sm:w-56">
          {journey.steps.map((step, i) => {
            const state =
              i < current ? "done" : i === current ? "current" : "upcoming"
            return (
              <li key={step.slug} className="flex-1">
                <Link
                  href={stepHref(journeyId, step.slug)}
                  title={`Step ${i + 1}: ${step.title}`}
                  aria-label={`Step ${i + 1}: ${step.title}${
                    state === "current" ? ", current" : ""
                  }`}
                  aria-current={state === "current" ? "step" : undefined}
                  className="group flex h-5 items-center"
                >
                  <span
                    className={cn(
                      "block w-full rounded-[2px]",
                      state === "done" && "h-1.5 bg-ink-muted",
                      state === "current" && "h-3 bg-ink",
                      state === "upcoming" && "h-1.5 bg-rule group-hover:bg-rule-strong"
                    )}
                  />
                </Link>
              </li>
            )
          })}
        </ol>
      </nav>
    </div>
  )
}
