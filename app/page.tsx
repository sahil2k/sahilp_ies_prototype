import Link from "next/link"
import { ActionBadge } from "@/components/action-badge"
import { IllustrativeData } from "@/components/illustrative-data"
import { PRODUCT_NAME, ProductMark } from "@/components/product-mark"
import { buttonVariants } from "@/components/ui/button"
import {
  closeSummary,
  company,
  draftedEntry,
  entities,
  taxQuestion,
  type ActionType,
} from "@/data/company"
import { hubHref, journeys, type JourneyId } from "@/data/journeys"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"

const legend: {
  type: ActionType
  meaning: string
  accountable: string
  example: string
}[] = [
  {
    type: "automated",
    meaning: "The AI does it alone.",
    accountable:
      "The AI, within limits it has earned. Every action is logged and can be reversed.",
    example: `Eliminated ${closeSummary.intercompanyEliminated} of ${closeSummary.intercompanyPairs} intercompany pairs across ${entities.length} entities overnight.`,
  },
  {
    type: "assisted",
    meaning: "The AI drafts, a person reviews and approves.",
    accountable: "You. Nothing posts until you approve it.",
    example: `Drafted a ${formatCurrency(draftedEntry.lines[0].debit)} accrual for unbilled freight, with its reasoning attached.`,
  },
  {
    type: "handoff",
    meaning:
      "The AI recommends a vetted expert when it isn't confident, or when the topic is regulated, like multi-state tax. You confirm before anyone is booked.",
    accountable:
      "A vetted expert, once you confirm. You see the price per question first, and your data is packaged for them.",
    example: `Recommended a multi-state tax CPA for an Arizona tax question: a regulated topic, and only ${taxQuestion.confidence}% confidence in its own answer. Sent after the controller confirmed.`,
  },
]

const entryPoints: {
  journeyId: JourneyId
  title: string
  who: string
  problem: string
  cta: string
}[] = [
  {
    journeyId: "finance",
    title: "I'm a finance leader",
    who: "For controllers and CFOs running a group of entities.",
    problem:
      "Close the books across every entity, with AI that shows its work and a vetted expert on call when a question needs one.",
    cta: "Open Finance",
  },
  {
    journeyId: "developer",
    title: "I'm a developer",
    who: "For ISVs and developers building for mid-market finance teams.",
    problem:
      "Connect once to a customer's whole group of entities, then build, publish and earn from agents.",
    cta: "Open Developer platform",
  },
]

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-rule bg-surface">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-3 md:px-8">
          <ProductMark />
          <nav aria-label="Areas" className="flex gap-6 text-small">
            <Link href={hubHref("finance")} className="text-ink underline underline-offset-4">
              Finance
            </Link>
            <Link href={hubHref("developer")} className="text-ink underline underline-offset-4">
              Developers
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-12 px-4 py-12 md:px-8 md:gap-16 md:py-16">
        <section className="flex max-w-[60ch] flex-col gap-4">
          <h1 className="text-[32px] leading-9 font-semibold tracking-[-0.01em] text-ink sm:text-display">
            {PRODUCT_NAME}
          </h1>
          <p className="text-h2 font-normal text-ink">
            The AI-native platform for mid-market finance, where the AI shows
            its work, earns its autonomy, and calls in an expert when it
            should.
          </p>
          <p className="text-body text-ink-muted">
            Built for finance teams running groups of entities, and for the
            developers who build for them.
          </p>
        </section>

        <section aria-labelledby="legend-heading" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div className="flex max-w-[72ch] flex-col gap-1">
              <h2 id="legend-heading" className="text-h2 text-ink">
                Every AI action says who is responsible
              </h2>
              <p className="text-body text-ink-muted">
                One of these three labels is on everything the AI does, in
                built-in agents and in agents from the marketplace.
              </p>
            </div>
            <IllustrativeData />
          </div>

          <div className="overflow-hidden rounded-panel border border-rule bg-surface">
            <div className="hidden grid-cols-[176px_1fr_1fr_1.2fr] gap-6 border-b border-rule bg-surface-sunken px-4 py-3 text-small font-medium text-ink-muted md:grid">
              <span>Label</span>
              <span>What it means</span>
              <span>Who is accountable</span>
              <span>Example from the {company.closePeriod} close</span>
            </div>
            <ul>
              {legend.map((row) => (
                <li
                  key={row.type}
                  className="grid gap-2 border-b border-rule px-4 py-4 last:border-b-0 md:grid-cols-[176px_1fr_1fr_1.2fr] md:gap-6"
                >
                  <div>
                    <ActionBadge type={row.type} />
                  </div>
                  <p className="text-body text-ink">{row.meaning}</p>
                  <p className="text-body text-ink-muted">
                    <span className="font-medium text-ink md:hidden">
                      Accountable:{" "}
                    </span>
                    {row.accountable}
                  </p>
                  <p className="tabular text-body text-ink-muted">
                    <span className="font-medium text-ink md:hidden">
                      Example:{" "}
                    </span>
                    {row.example}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <p className="flex flex-wrap items-center gap-2 text-small text-ink-muted">
            Tasks start as <ActionBadge type="assisted" /> and are promoted to{" "}
            <ActionBadge type="automated" /> only after proving their accuracy
            over several months.
          </p>
        </section>

        <section aria-labelledby="entry-heading" className="flex flex-col gap-4">
          <h2 id="entry-heading" className="text-h2 text-ink">
            Get started
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {entryPoints.map((entry) => {
              const journey = journeys[entry.journeyId]
              return (
                <article
                  key={entry.journeyId}
                  className="flex flex-col rounded-panel border border-rule bg-surface"
                >
                  <div className="flex flex-col gap-2 border-b border-rule p-6 max-sm:p-4">
                    <h3 className="text-h2 text-ink">{entry.title}</h3>
                    <p className="text-small text-ink-muted">{entry.who}</p>
                    <p className="text-body text-ink">{entry.problem}</p>
                  </div>
                  <div className="flex flex-1 flex-col gap-6 p-6 max-sm:p-4">
                    <ol className="flex flex-col gap-2">
                      {journey.steps.map((step, i) => (
                        <li key={step.slug} className="flex gap-3 text-body">
                          <span className="tabular w-4 shrink-0 text-ink-muted">
                            {i + 1}
                          </span>
                          <span className="text-ink">{step.title}</span>
                        </li>
                      ))}
                    </ol>
                    <div className="mt-auto flex flex-wrap items-center justify-end gap-3">
                      <Link
                        href={hubHref(entry.journeyId)}
                        className={cn(buttonVariants(), "max-sm:w-full")}
                      >
                        {entry.cta}
                      </Link>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
          <p className="max-w-[72ch] text-small text-ink-muted">
            Agents from the marketplace work inside your close and carry the
            same labels as built-in agents.
          </p>
        </section>
      </main>

      <footer className="border-t border-rule">
        <p className="mx-auto max-w-[1200px] px-4 py-6 text-small text-ink-muted md:px-8">
          {company.groupName} is a fictional company. All figures are
          illustrative.
        </p>
      </footer>
    </div>
  )
}
