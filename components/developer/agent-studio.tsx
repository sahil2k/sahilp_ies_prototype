"use client"

import { useState } from "react"
import { Check, Plus, X } from "lucide-react"
import { ActionBadge, actionTypes } from "@/components/action-badge"
import { AgentMark } from "@/components/agent-mark"
import { NextStepBar, stepTargets } from "@/components/journey/next-step-bar"
import { PageHeader } from "@/components/page-header"
import { Panel } from "@/components/panel"
import { StatusNote } from "@/components/status-note"
import { Button } from "@/components/ui/button"
import type { ActionType } from "@/data/company"
import { company } from "@/data/company"
import { agent, agentTestRun, maxDeclaredActions } from "@/data/developer"
import { setAgentConfig, useAgentConfig, type AgentConfigAction } from "@/lib/agent-store"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"

const allTypes: ActionType[] = ["automated", "assisted", "handoff"]

const handled = [
  "Managed OAuth for every customer that installs Flowcast",
  "Multi-tenant hosting, scaled to installs",
  "A sandbox pre-loaded with a multi-entity company to build and test against",
]

let nextId = 1
function newActionId() {
  return `draft-${Date.now()}-${nextId++}`
}

export function AgentStudio() {
  const stored = useAgentConfig()
  // A local edit buffer, seeded once from the shared store. Nothing writes
  // back until "Save configuration" — matches how a real settings form works.
  const [draft, setDraft] = useState(() => structuredClone(stored))
  const [saved, setSaved] = useState(false)
  const [tested, setTested] = useState(false)

  const updateAction = (id: string, patch: Partial<AgentConfigAction>) => {
    setSaved(false)
    setDraft((d) => ({
      ...d,
      actions: d.actions.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }))
  }

  const removeAction = (id: string) => {
    setSaved(false)
    setDraft((d) => ({ ...d, actions: d.actions.filter((a) => a.id !== id) }))
  }

  const addAction = () => {
    setSaved(false)
    setDraft((d) => ({
      ...d,
      actions: [...d.actions, { id: newActionId(), type: "assisted", text: "" }],
    }))
  }

  const save = () => {
    setAgentConfig(draft)
    setSaved(true)
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Agent Studio"
        status={[`Sandbox: ${company.groupName}`, agent.name, saved ? "Saved" : "Editing"]}
        description="Edit Flowcast's listing and declared actions. Customers see this on its marketplace listing — Flowcast's actual logic runs in Ridgeline Software's own systems, not here."
      />

      <Panel title="Listing details">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <AgentMark />
            <div className="flex flex-col gap-0.5">
              <span className="text-h3 text-ink">{agent.name}</span>
              <span className="text-small text-ink-muted">Name is fixed once published</span>
            </div>
          </div>

          <Field label="Tagline">
            <input
              value={draft.tagline}
              onChange={(e) => {
                setSaved(false)
                setDraft((d) => ({ ...d, tagline: e.target.value }))
              }}
              className="h-10 rounded-control border border-rule-strong bg-surface px-3 text-body text-ink"
            />
          </Field>

          <Field label="Category">
            <input
              value={draft.category}
              onChange={(e) => {
                setSaved(false)
                setDraft((d) => ({ ...d, category: e.target.value }))
              }}
              className="h-10 rounded-control border border-rule-strong bg-surface px-3 text-body text-ink sm:w-64"
            />
          </Field>

          <Field label="Description">
            <textarea
              value={draft.description}
              onChange={(e) => {
                setSaved(false)
                setDraft((d) => ({ ...d, description: e.target.value }))
              }}
              rows={3}
              className="rounded-control border border-rule-strong bg-surface p-3 text-body text-ink"
            />
          </Field>

          <Field label="Price">
            <span className="relative w-40">
              <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-muted">
                $
              </span>
              <input
                inputMode="decimal"
                value={draft.pricePerMonth}
                onChange={(e) => {
                  setSaved(false)
                  const n = Number(e.target.value.replace(/[^0-9.]/g, ""))
                  setDraft((d) => ({ ...d, pricePerMonth: Number.isFinite(n) ? n : 0 }))
                }}
                className="tabular h-10 w-full rounded-control border border-rule-strong bg-surface pr-3 pl-7 text-body text-ink"
              />
            </span>
            <span className="text-small text-ink-muted">per customer, per month</span>
          </Field>
        </div>
      </Panel>

      <Panel
        title="Declared actions"
        aside={
          <span className="text-small text-ink-muted">
            {draft.actions.length} of {maxDeclaredActions}
          </span>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="max-w-[72ch] text-body text-ink-muted">
            Say what Flowcast does, in plain language. This is a declaration
            customers read before they install it, not code Intuit runs.
          </p>
          <ul className="flex flex-col gap-4">
            {draft.actions.map((a, i) => (
              <li
                key={a.id}
                className="flex flex-col gap-3 border-t border-rule pt-4 first:border-t-0 first:pt-0"
              >
                <div className="flex items-center justify-between gap-3">
                  <TypeSelector
                    value={a.type}
                    onChange={(type) => updateAction(a.id, { type })}
                    label={`Action ${i + 1} type`}
                  />
                  <Button
                    variant="quiet"
                    size="sm"
                    className="h-auto shrink-0 text-ink-muted no-underline hover:text-negative"
                    onClick={() => removeAction(a.id)}
                    aria-label={`Remove action ${i + 1}`}
                  >
                    <X aria-hidden className="size-4" />
                  </Button>
                </div>
                <textarea
                  value={a.text}
                  onChange={(e) => updateAction(a.id, { text: e.target.value })}
                  rows={2}
                  placeholder="What does this action do?"
                  className="rounded-control border border-rule-strong bg-surface p-3 text-body text-ink"
                />
              </li>
            ))}
          </ul>
          <Button
            variant="secondary"
            size="sm"
            onClick={addAction}
            disabled={draft.actions.length >= maxDeclaredActions}
            className="self-start"
          >
            <Plus aria-hidden className="size-4" />
            Add a declared action
          </Button>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-rule pt-4">
          <Button onClick={save}>Save configuration</Button>
          {saved && (
            <StatusNote tone="success" className="flex-1">
              <p>Saved. Customers now see this on Flowcast&apos;s marketplace listing.</p>
            </StatusNote>
          )}
        </div>
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
            A preview of how a declared action shows up in practice, using{" "}
            {company.groupName}&apos;s sandbox data. Flowcast&apos;s actual
            decision runs in Ridgeline Software&apos;s own systems — this
            isn&apos;t a live call to it.
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-small font-medium text-ink-muted">{label}</span>
      {children}
    </label>
  )
}

function TypeSelector({
  value,
  onChange,
  label,
}: {
  value: ActionType
  onChange: (type: ActionType) => void
  label: string
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
      {allTypes.map((t) => {
        const selected = t === value
        const { icon: Icon } = actionTypes[t]
        return (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(t)}
            className={cn(
              "inline-flex h-7 items-center gap-1 rounded-control border px-2 text-badge whitespace-nowrap transition-colors",
              selected
                ? actionTypes[t].className
                : "border-rule bg-surface text-ink-muted hover:bg-row-hover"
            )}
          >
            <Icon aria-hidden className="size-3.5" strokeWidth={2.25} />
            {actionTypes[t].label}
          </button>
        )
      })}
    </div>
  )
}
