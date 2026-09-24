import Link from "next/link"
import { ActionBadge } from "@/components/action-badge"
import { PageHeader } from "@/components/page-header"
import type { ActionType } from "@/data/company"
import { connectingScreen, journeys, stepHref, type JourneyId } from "@/data/journeys"
import { cn } from "@/lib/utils"

// Hub for a persona: every screen as a card, openable in any order. Cards are
// bordered panels (docs/design.md 7.1); the whole card is the link.
export function Hub({
  journeyId,
  status,
  illustrative = true,
}: {
  journeyId: JourneyId
  status: React.ReactNode[]
  illustrative?: boolean
}) {
  const journey = journeys[journeyId]

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={journey.hubTitle} status={status} illustrative={illustrative} />

      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {journey.steps.map((step, i) => (
          <li key={step.slug} className="flex">
            <HubCard
              href={stepHref(journeyId, step.slug)}
              number={i + 1}
              title={step.title}
              summary={step.summary}
              actionTypes={step.actionTypes}
            />
          </li>
        ))}
        <li className="flex">
          <HubCard
            href={connectingScreen.href}
            title={connectingScreen.title}
            summary={connectingScreen.summary}
            actionTypes={["automated", "assisted", "handoff"]}
            muted
          />
        </li>
      </ul>
    </div>
  )
}

function HubCard({
  href,
  number,
  title,
  summary,
  actionTypes,
  muted = false,
}: {
  href: string
  number?: number
  title: string
  summary: string
  actionTypes: ActionType[]
  muted?: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex w-full flex-col gap-3 rounded-panel border p-5 transition-colors hover:border-rule-strong hover:bg-row-hover",
        muted ? "border-dashed border-rule-strong bg-canvas" : "border-rule bg-surface"
      )}
    >
      <span className="flex items-baseline gap-3">
        {number !== undefined && (
          <span className="tabular text-small text-ink-muted">{number}</span>
        )}
        <span className="text-h3 text-ink">{title}</span>
      </span>
      <span className="text-body text-ink-muted">{summary}</span>
      {actionTypes.length > 0 && (
        <span className="flex flex-wrap gap-2">
          {actionTypes.map((t) => (
            <ActionBadge key={t} type={t} />
          ))}
        </span>
      )}
      <span className="mt-auto pt-1 text-small text-ink underline underline-offset-4 group-hover:decoration-2">
        Open {title.toLowerCase()}
      </span>
    </Link>
  )
}
