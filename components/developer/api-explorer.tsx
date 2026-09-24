"use client"

import { useState } from "react"
import { NextStepBar, stepTargets } from "@/components/journey/next-step-bar"
import { PageHeader } from "@/components/page-header"
import { Panel } from "@/components/panel"
import { Button } from "@/components/ui/button"
import { company, entities } from "@/data/company"
import { cashPositionEndpoint, cashPositionResponse } from "@/data/developer"
import { formatCurrency } from "@/lib/format"

// The customer's own consent choices, shown here only as an illustration of
// what they see and control. Fixed, not wired to anything the developer can
// change.
const customerPreviewSelection = new Set(["chi", "cfr", "cft", "cfs", "cda"])

export function ApiExplorer() {
  const [sent, setSent] = useState(false)

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="API explorer"
        status={[`Sandbox: ${company.groupName}`, `${entities.length} entities`, "Always connected"]}
        description="Your sandbox is a full multi-entity company. Send a request and read across every entity in one call."
      />

      <Panel title="Your sandbox">
        <div className="flex flex-col gap-4">
          <p className="max-w-[72ch] text-body text-ink-muted">
            Ridgeline Software&apos;s sandbox is a full copy of a multi-entity
            company, already connected. Nothing to authorize, no redirect to
            set up.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {entities.map((e) => (
              <li
                key={e.id}
                className="rounded-control border border-rule px-3 py-2 text-body text-ink"
              >
                {e.shortName}
              </li>
            ))}
          </ul>
        </div>
      </Panel>

      <Panel title="Try a request">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2 rounded-control border border-rule bg-surface-sunken px-4 py-2.5">
            <span className="rounded-[3px] bg-ink px-1.5 py-0.5 font-mono text-badge text-white">
              {cashPositionEndpoint.method}
            </span>
            <span className="font-mono text-code text-ink">{cashPositionEndpoint.path}</span>
          </div>
          <Button variant="secondary" onClick={() => setSent(true)} className="self-start">
            Send request
          </Button>
          {sent && (
            <>
              <pre className="overflow-x-auto rounded-control border border-rule bg-surface-sunken p-4">
                <code className="font-mono text-code text-ink">
                  {JSON.stringify(cashPositionResponse, null, 2)}
                </code>
              </pre>
              {cashPositionResponse.entities.some((e) => e.atRisk) && (
                <p className="text-small text-ink-muted">
                  {formatCurrency(
                    cashPositionResponse.entities.find((e) => e.atRisk)!.balance
                  )}{" "}
                  at Cedarline Cold Storage is below its minimum threshold. An
                  agent can act on that — see Agent Studio next.
                </p>
              )}
            </>
          )}
        </div>
      </Panel>

      <Panel
        title="What your customer sees"
        aside={<span className="text-small text-ink-muted">Preview only</span>}
      >
        <div className="flex flex-col gap-4">
          <p className="max-w-[72ch] text-body text-ink-muted">
            When a real customer installs Flowcast, they see one consent
            screen for their whole group. They choose which entities to
            include, and can revoke any entity later without disconnecting
            the rest. Your sandbox skips this step — it&apos;s already fully
            connected.
          </p>
          <div
            aria-disabled
            className="pointer-events-none flex flex-col gap-3 rounded-control border border-dashed border-rule-strong bg-surface-sunken p-4 opacity-70"
          >
            <p className="text-body font-medium text-ink">
              Ridgeline Software wants to connect to {company.groupName}
            </p>
            <ul className="grid gap-1.5 sm:grid-cols-2">
              {entities.map((e) => (
                <li key={e.id} className="flex items-center gap-2 text-body text-ink">
                  <span
                    aria-hidden
                    className={
                      customerPreviewSelection.has(e.id)
                        ? "flex size-4 shrink-0 items-center justify-center rounded-[3px] border border-ink bg-ink text-[10px] text-white"
                        : "size-4 shrink-0 rounded-[3px] border border-rule-strong"
                    }
                  >
                    {customerPreviewSelection.has(e.id) ? "✓" : ""}
                  </span>
                  {e.shortName}
                </li>
              ))}
            </ul>
            <span className="self-start rounded-control bg-ink px-4 py-2 text-body font-medium text-white">
              Connect
            </span>
          </div>
          <p className="text-small text-ink-muted">
            Your customer sees and controls this screen. You never do.
          </p>
        </div>
      </Panel>

      <NextStepBar
        {...stepTargets("developer", "onboarding")}
        hint="Build an agent that acts on data like this."
      />
    </div>
  )
}
