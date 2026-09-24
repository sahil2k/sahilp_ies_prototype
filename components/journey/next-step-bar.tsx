import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import {
  connectingScreen,
  hubHref,
  journeys,
  findStep,
  stepHref,
  type JourneyId,
} from "@/data/journeys"
import { cn } from "@/lib/utils"

type Target = { href: string; label: string }

// The one primary action per journey screen (docs/design.md 5.2), pinned to
// the bottom of the viewport so the next click is never hard to find. `hint`
// says what to do on this screen before moving on, or confirms it's done.
export function NextStepBar({
  back,
  next,
  hint,
}: {
  back?: Target
  next: Target
  hint?: React.ReactNode
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-rule bg-surface pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 md:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-6">
          {back && (
            <Link
              href={back.href}
              className="shrink-0 text-small text-ink underline underline-offset-4"
            >
              <span className="sm:hidden">Back</span>
              <span className="hidden sm:inline">{back.label}</span>
            </Link>
          )}
          {hint && (
            <p className="hidden min-w-0 text-small text-ink-muted md:block">{hint}</p>
          )}
        </div>
        <Link
          href={next.href}
          className={cn(buttonVariants(), "max-sm:flex-1 max-sm:whitespace-normal")}
        >
          {next.label}
        </Link>
      </div>
    </div>
  )
}

/** Back/next targets for a journey step, derived from data/journeys.ts. */
export function stepTargets(journeyId: JourneyId, slug: string) {
  const found = findStep(journeyId, slug)
  if (!found) throw new Error(`Unknown step ${journeyId}/${slug}`)
  const { prev, next } = found
  return {
    back: prev
      ? { href: stepHref(journeyId, prev.slug), label: `Back to ${prev.title.toLowerCase()}` }
      : { href: hubHref(journeyId), label: `Back to ${journeys[journeyId].hubLabel.toLowerCase()}` },
    next: next
      ? { href: stepHref(journeyId, next.slug), label: next.nextLabel }
      : { href: connectingScreen.href, label: connectingScreen.nextLabel },
  }
}
