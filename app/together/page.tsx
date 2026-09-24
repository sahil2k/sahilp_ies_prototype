import Link from "next/link"
import { LayoutGrid, Store } from "lucide-react"
import { ActionBadge } from "@/components/action-badge"
import { PageHeader } from "@/components/page-header"
import { ProductMark } from "@/components/product-mark"
import { company } from "@/data/company"
import { connectingScreen, hubHref, journeys } from "@/data/journeys"

// Connecting screen, reachable from both hubs. Not built out yet: it shows
// the empty state a customer sees before any marketplace agent is installed.
export default function Page() {
  const { finance, developer } = journeys
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-rule bg-surface">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-8">
          <ProductMark />
          <nav aria-label="Areas" className="flex flex-wrap gap-x-6 gap-y-2 text-small">
            {[finance, developer].map((j) => (
              <Link
                key={j.id}
                href={hubHref(j.id)}
                className="inline-flex items-center gap-1.5 text-ink underline underline-offset-4"
              >
                <LayoutGrid aria-hidden className="size-3.5" />
                {j.hubLabel}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-8 px-4 py-12 md:px-8">
        <PageHeader
          title={connectingScreen.title}
          status={[`${company.closePeriod} close`, "0 marketplace agents installed"]}
          illustrative={false}
        />
        <div className="flex flex-col items-start gap-3 rounded-panel border border-dashed border-rule-strong bg-surface p-6">
          <Store aria-hidden className="size-5 text-ink-muted" />
          <p className="text-h3 text-ink">No marketplace agents yet</p>
          <p className="max-w-[60ch] text-body text-ink-muted">
            Agents you install from the marketplace work inside your close, and
            every action they take carries the same labels as built-in agents.
          </p>
          <span className="flex flex-wrap gap-2">
            <ActionBadge type="automated" />
            <ActionBadge type="assisted" />
            <ActionBadge type="handoff" />
          </span>
        </div>
      </main>
    </div>
  )
}
