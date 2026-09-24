import { journeys, type JourneyId } from "@/data/journeys"
import { ProductMark } from "@/components/product-mark"
import { JourneyProgress } from "./journey-progress"

// Shared frame for the finance and developer areas: product bar with the
// workspace name, hub link and step indicator, then a content column. Each
// screen adds its own <NextStepBar>.
export function JourneyShell({
  journeyId,
  children,
}: {
  journeyId: JourneyId
  children: React.ReactNode
}) {
  const journey = journeys[journeyId]

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-20 border-b border-rule bg-surface">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-3 px-4 py-3 md:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <ProductMark />
            <span aria-hidden className="hidden h-5 w-px bg-rule sm:block" />
            <span className="hidden text-small text-ink-muted sm:inline">
              {journey.name}
            </span>
          </div>
          <JourneyProgress journeyId={journeyId} />
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col px-4 pt-8 pb-28 md:px-8 md:pt-12">
        {children}
      </main>
    </div>
  )
}
