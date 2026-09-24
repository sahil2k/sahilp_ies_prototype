"use client"

import { ShieldCheck, Users } from "lucide-react"
import { ActionBadge } from "@/components/action-badge"
import { AgentMark } from "@/components/agent-mark"
import { NextStepBar, stepTargets } from "@/components/journey/next-step-bar"
import { PageHeader } from "@/components/page-header"
import { Panel } from "@/components/panel"
import { agent, isv, listing, trustEligible } from "@/data/developer"
import { useAgentConfig } from "@/lib/agent-store"
import { formatCurrency } from "@/lib/format"

const dateLabel = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

export function MarketplaceListing() {
  const config = useAgentConfig()
  const eligible = trustEligible()
  const { communityTrust: trust } = listing

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Marketplace listing"
        status={[
          agent.name,
          `Live since ${dateLabel(listing.publishedOn)}`,
          "Reviewed for security",
        ]}
        description="This is what a customer sees when they find Flowcast inside their IES marketplace — it reflects whatever you last saved in Agent Studio."
      />

      <Panel title="Listing preview">
        <div className="flex flex-col gap-5">
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
            <div className="flex flex-col items-end gap-0.5">
              <span className="tabular text-h3 text-ink">{formatCurrency(config.pricePerMonth)}</span>
              <span className="text-small text-ink-muted">per month</span>
            </div>
          </div>
          <p className="max-w-[72ch] text-body text-ink">{config.description}</p>
          <ul className="flex flex-col gap-3 border-t border-rule pt-4">
            {config.actions.map((a) => (
              <li key={a.id} className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-3">
                <ActionBadge type={a.type} className="shrink-0" />
                <span className="text-body text-ink">{a.text}</span>
              </li>
            ))}
          </ul>
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
                {trust.ratings} of {trust.ratingsThreshold} ratings so far
              </span>
            )}
          </div>
        </div>
      </Panel>

      <Panel title="Trust on the marketplace">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5 border-b border-rule pb-4">
            <h3 className="text-body font-medium text-ink">Reviewed for security</h3>
            <p className="text-body text-ink-muted">
              Every listed agent passes Intuit&apos;s security and technical
              review before it&apos;s published, reviewed on{" "}
              {dateLabel(listing.securityReview.reviewedOn)}. This checks
              security, not the quality of an agent&apos;s financial advice.
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <h3 className="text-body font-medium text-ink">Community trusted</h3>
            <p className="text-body text-ink-muted">
              A separate, crowd-sourced badge. Customers who&apos;ve installed
              Flowcast can rate it trustworthy. It needs {trust.ratingsThreshold}{" "}
              ratings and {trust.trustworthyThreshold}% marking it trustworthy.
              Flowcast has {trust.ratings} ratings, {trust.trustworthyPercent}%
              trustworthy —{" "}
              {eligible
                ? "eligible."
                : `${trust.ratingsThreshold - trust.ratings} more ratings needed.`}
            </p>
          </div>
        </div>
      </Panel>

      <Panel title="Liability">
        <p className="max-w-[72ch] text-body text-ink-muted">
          Customers accept Flowcast&apos;s output under IES&apos;s standard
          marketplace terms. Liability for what an installed agent does sits
          with the customer who installed it, not with Intuit or with{" "}
          {isv.name}.
        </p>
      </Panel>

      <NextStepBar
        {...stepTargets("developer", "publishing")}
        hint="See the group-level API Flowcast is built on."
      />
    </div>
  )
}
