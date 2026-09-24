"use client"

import { useState } from "react"
import { NextStepBar, stepTargets } from "@/components/journey/next-step-bar"
import { PageHeader } from "@/components/page-header"
import { Panel } from "@/components/panel"
import { StatusNote } from "@/components/status-note"
import { Button } from "@/components/ui/button"
import { company, entities } from "@/data/company"
import { cashPositionEndpoint, cashPositionResponse } from "@/data/developer"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"

export function ApiExplorer() {
  const [selected, setSelected] = useState(new Set(entities.map((e) => e.id)))
  const [connected, setConnected] = useState(false)
  const [sent, setSent] = useState(false)

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const scopedEntities = cashPositionResponse.entities.filter((e) => selected.has(e.entityId))
  const scopedConsolidated = scopedEntities.reduce((sum, e) => sum + e.balance, 0)

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="API explorer"
        status={[
          `Sandbox: ${company.groupName}`,
          connected
            ? `${selected.size} of ${entities.length} entities connected`
            : `${entities.length} entities available`,
          connected ? "Connected" : "Not connected",
        ]}
        description="Connect once to the sandbox, then read across every entity you included in one call."
      />

      <Panel
        title="Connect your sandbox"
        aside={connected && <StatusPill>Connected</StatusPill>}
      >
        <div className="flex flex-col gap-5">
          <p className="max-w-[72ch] text-body text-ink-muted">
            One connection covers the whole group. Choose which entities to
            include — you can change this anytime, per entity, without
            reconnecting.
          </p>
          <fieldset className="grid gap-2 sm:grid-cols-2">
            <legend className="sr-only">Entities to include</legend>
            {entities.map((e) => (
              <label
                key={e.id}
                className={cn(
                  "flex items-center gap-2.5 rounded-control border p-3 text-body",
                  selected.has(e.id) ? "border-ink bg-primary-tint" : "border-rule"
                )}
              >
                <input
                  type="checkbox"
                  checked={selected.has(e.id)}
                  onChange={() => toggle(e.id)}
                  className="size-4 accent-ink"
                />
                <span className="text-ink">{e.shortName}</span>
              </label>
            ))}
          </fieldset>
          {!connected ? (
            <Button
              onClick={() => setConnected(true)}
              disabled={selected.size === 0}
              className="self-start"
            >
              Connect {selected.size} of {entities.length} entities
            </Button>
          ) : (
            <StatusNote tone="success">
              <p>
                Connected to {company.groupName}. Ridgeline Software can read
                across {selected.size} of {entities.length} entities. Revoke
                access for any entity here at any time.
              </p>
            </StatusNote>
          )}
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
          <Button
            variant="secondary"
            onClick={() => setSent(true)}
            disabled={!connected}
            className="self-start"
          >
            Send request
          </Button>
          {!connected && (
            <p className="text-small text-ink-muted">Connect your sandbox first.</p>
          )}
          {connected && sent && (
            <pre className="overflow-x-auto rounded-control border border-rule bg-surface-sunken p-4">
              <code className="font-mono text-code text-ink">
                {JSON.stringify(
                  {
                    groupId: cashPositionResponse.groupId,
                    asOf: cashPositionResponse.asOf,
                    consolidated: {
                      balance: Math.round(scopedConsolidated * 100) / 100,
                      currency: cashPositionResponse.consolidated.currency,
                    },
                    entities: scopedEntities,
                    intercompanyTransfersPending: cashPositionResponse.intercompanyTransfersPending,
                  },
                  null,
                  2
                )}
              </code>
            </pre>
          )}
          {connected && sent && scopedEntities.some((e) => e.atRisk) && (
            <p className="text-small text-ink-muted">
              {formatCurrency(
                scopedEntities.find((e) => e.atRisk)!.balance
              )}{" "}
              at Cedarline Cold Storage is below its minimum threshold. An
              agent can act on that — see Agent Studio next.
            </p>
          )}
        </div>
      </Panel>

      <NextStepBar
        {...stepTargets("developer", "onboarding")}
        hint="Build an agent that acts on data like this."
      />
    </div>
  )
}

function StatusPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-control border border-positive/40 bg-surface px-2 py-0.5 text-small font-medium text-positive">
      {children}
    </span>
  )
}
