"use client"

import Link from "next/link"
import { LayoutGrid, ShieldCheck, Users } from "lucide-react"
import { ActionBadge } from "@/components/action-badge"
import { AgentMark } from "@/components/agent-mark"
import { PageHeader } from "@/components/page-header"
import { Panel } from "@/components/panel"
import { PRODUCT_NAME, ProductMark } from "@/components/product-mark"
import { company } from "@/data/company"
import { agent, cedarlineInstall, agentTestRun, isv, listing, trustEligible } from "@/data/developer"
import { connectingScreen, hubHref, journeys } from "@/data/journeys"
import { useAgentConfig } from "@/lib/agent-store"
import { formatCurrency } from "@/lib/format"

const dateLabel = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

const monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
function formatTime(iso: string) {
  const [date, time] = iso.split("T")
  const [, m, day] = date.split("-").map(Number)
  const [h, min] = time.split(":").map(Number)
  const hour12 = h % 12 || 12
  return `${monthsShort[m - 1]} ${day}, ${hour12}:${String(min).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`
}

// Reachable from both hubs, so this is written as an observer's caption —
// "here's what shows up in Cedarline Group's close" — never assuming the
// reader is the controller or the developer. It's the one screen that has
// to be honest from either entry point.
export default function Page() {
  const { finance, developer } = journeys
  const config = useAgentConfig()
  const eligible = trustEligible()

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
          status={[`${company.closePeriod} close`, "1 marketplace agent installed"]}
          description={connectingScreen.summary}
        />

        <Panel
          title="Installed agent"
          aside={
            <Link
              href="/developer/publishing"
              className="text-small text-ink underline underline-offset-4"
            >
              See the full listing
            </Link>
          }
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <AgentMark />
                <div className="flex flex-col gap-0.5">
                  <span className="text-h3 text-ink">{agent.name}</span>
                  <span className="text-small text-ink-muted">
                    {config.tagline} · by {isv.name}
                  </span>
                </div>
              </div>
              <span className="text-small text-ink-muted">
                Installed {dateLabel(cedarlineInstall.installedOn)}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-rule pt-4">
              <span className="inline-flex items-center gap-1.5 rounded-control border border-positive/40 px-2 py-1 text-small font-medium text-positive">
                <ShieldCheck aria-hidden className="size-3.5" />
                Reviewed for security
              </span>
              {eligible ? (
                <span className="inline-flex items-center gap-1.5 rounded-control border border-readiness/40 px-2 py-1 text-small font-medium text-readiness-strong">
                  <Users aria-hidden className="size-3.5" />
                  Community trusted
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-control border border-rule px-2 py-1 text-small text-ink-muted">
                  <Users aria-hidden className="size-3.5" />
                  {listing.communityTrust.ratings} of {listing.communityTrust.ratingsThreshold} ratings so far
                </span>
              )}
            </div>
          </div>
        </Panel>

        <Panel
          title="Recent AI activity"
          aside={
            <Link
              href="/finance/close-dashboard"
              className="text-small text-ink underline underline-offset-4"
            >
              See the close dashboard
            </Link>
          }
          bodyClassName="p-0 md:p-0"
        >
          <ul>
            <li className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 border-b border-rule px-4 py-3.5 last:border-b-0 md:px-6 lg:grid-cols-[120px_1fr_140px] lg:items-center">
              <span className="tabular order-2 text-small text-ink-muted lg:order-none">
                {formatTime(cedarlineInstall.actionTimestamp)}
              </span>
              <span className="order-1 col-span-2 flex flex-col lg:order-none lg:col-span-1">
                <span className="text-body text-ink">
                  Flagged {agentTestRun.entityName}: balance{" "}
                  {formatCurrency(agentTestRun.balance)} is below its{" "}
                  {formatCurrency(agentTestRun.minimumThreshold)} minimum, projected in{" "}
                  {agentTestRun.daysToShortfall} days.
                </span>
                <span className="text-small text-ink-muted">By {agent.name}</span>
              </span>
              <span className="order-3 lg:order-none">
                <ActionBadge type="automated" />
              </span>
            </li>
          </ul>
          <p className="border-t border-rule px-4 py-3 text-small text-ink-muted md:px-6">
            Labelled the same way as {PRODUCT_NAME}&apos;s own AI activity elsewhere in
            the close.
          </p>
        </Panel>

        <Panel title="What else Flowcast does here">
          <ul className="flex flex-col gap-3">
            {config.actions
              .filter((a) => a.id !== "cash-shortfall")
              .map((a) => (
                <li key={a.id} className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-3">
                  <ActionBadge type={a.type} className="shrink-0" />
                  <span className="text-body text-ink">{a.text}</span>
                </li>
              ))}
          </ul>
        </Panel>

        <Panel title="How marketplace agents are labelled">
          <p className="max-w-[72ch] text-body text-ink-muted">
            Every action a marketplace agent takes carries the same Automated,
            Assisted or Human handoff label as {PRODUCT_NAME}&apos;s own
            built-in agents — the same accountability, whoever built it.
          </p>
        </Panel>
      </main>
    </div>
  )
}
