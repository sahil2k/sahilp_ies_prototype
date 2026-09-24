"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { ActionBadge } from "@/components/action-badge"
import { AgentMark } from "@/components/agent-mark"
import { NextStepBar, stepTargets } from "@/components/journey/next-step-bar"
import { PageHeader } from "@/components/page-header"
import { Panel } from "@/components/panel"
import { Button } from "@/components/ui/button"
import { company } from "@/data/company"
import { agent, agentTestRun } from "@/data/developer"
import { formatCurrency } from "@/lib/format"

const handled = [
  "Managed OAuth for every customer that installs Flowcast",
  "Multi-tenant hosting, scaled to installs",
  "A sandbox pre-loaded with a multi-entity company to build and test against",
]

export function AgentStudio() {
  const [tested, setTested] = useState(false)

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Agent Studio"
        status={[`Sandbox: ${company.groupName}`, agent.name, "Draft"]}
        description="Configure Flowcast and declare what it does. Customers see these declarations on its marketplace listing."
      />

      <Panel title="Flowcast">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <AgentMark />
            <div className="flex flex-col gap-0.5">
              <span className="text-h3 text-ink">{agent.name}</span>
              <span className="text-small text-ink-muted">
                {agent.tagline} · {agent.category}
              </span>
            </div>
          </div>
          <p className="max-w-[72ch] text-body text-ink">{agent.description}</p>
          <p className="tabular text-body text-ink">
            {formatCurrency(agent.pricePerMonth)}{" "}
            <span className="text-small text-ink-muted">per customer, per month</span>
          </p>
        </div>
      </Panel>

      <Panel title="What Flowcast does">
        <ul className="flex flex-col gap-4">
          {agent.actions.map((a) => (
            <li key={a.type} className="flex flex-col items-start gap-2 border-t border-rule pt-4 first:border-t-0 first:pt-0">
              <ActionBadge type={a.type} />
              <p className="text-body text-ink">{a.text}</p>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Auth and hosting">
        <ul className="flex flex-col gap-2.5">
          {handled.map((item) => (
            <li key={item} className="flex gap-2 text-body text-ink">
              <Check aria-hidden className="mt-[3px] size-4 shrink-0 text-positive" />
              {item}
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Test in your sandbox">
        <div className="flex flex-col gap-4">
          <p className="text-body text-ink-muted">
            Run Flowcast against {company.groupName}&apos;s sandbox data.
          </p>
          {!tested ? (
            <Button onClick={() => setTested(true)} className="self-start">
              Run test
            </Button>
          ) : (
            <div className="flex flex-col gap-2 rounded-control border border-l-[3px] border-rule border-l-automated bg-surface p-4">
              <ActionBadge type="automated" className="self-start" />
              <p className="text-body text-ink">
                Flagged {agentTestRun.entityName}: balance{" "}
                {formatCurrency(agentTestRun.balance)} is below its{" "}
                {formatCurrency(agentTestRun.minimumThreshold)} minimum,
                projected in {agentTestRun.daysToShortfall} days.
              </p>
            </div>
          )}
        </div>
      </Panel>

      <NextStepBar
        {...stepTargets("developer", "agent-studio")}
        hint="Publish Flowcast to the marketplace."
      />
    </div>
  )
}
