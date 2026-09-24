"use client"

import { useState } from "react"
import { ConfidenceMeter } from "@/components/confidence-meter"
import { EvidenceList } from "@/components/evidence-list"
import { NextStepBar, stepTargets } from "@/components/journey/next-step-bar"
import { PageHeader } from "@/components/page-header"
import { Panel } from "@/components/panel"
import { StatusNote } from "@/components/status-note"
import { Button } from "@/components/ui/button"
import { aiTasks, draftedEntry, entityById } from "@/data/company"
import { recentAccuracy } from "@/lib/confidence"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useFinance } from "./finance-state"

const entity = entityById(draftedEntry.entityId)!
const task = aiTasks.find((t) => t.id === "task-accruals-ccs")!
const lastMonth = recentAccuracy(task.history, 1)
const drafted = draftedEntry.lines[0].debit
// PO-5562 was billed 4% above contract. At the contract rate it would be:
const contractAdjusted = Math.round((drafted - 6_300 + 6_300 / 1.04) * 100) / 100

const dateLabel = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

const statusText = {
  draft: "Draft, awaiting your approval",
  approved: "Approved and posted",
  reversed: "Reversed",
} as const

export function AssistedFix() {
  const { state, update } = useFinance()
  const [editing, setEditing] = useState(false)
  const [input, setInput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const { entry } = state
  const amount = entry.amount

  const startEdit = () => {
    setInput(amount.toFixed(2))
    setError(null)
    setEditing(true)
  }

  const saveEdit = () => {
    const value = Number(input.replace(/[$,\s]/g, ""))
    if (!Number.isFinite(value) || value <= 0) {
      setError("Enter an amount greater than zero, for example 18157.69.")
      return
    }
    const rounded = Math.round(value * 100) / 100
    update((s) => ({
      ...s,
      entry: { ...s.entry, amount: rounded, edited: rounded !== drafted },
    }))
    setEditing(false)
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Review drafted entry"
        status={[
          entity.name,
          `Journal entry ${draftedEntry.id.toUpperCase()}`,
          statusText[entry.status],
          `Medium confidence, ${draftedEntry.confidence}%`,
        ]}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[1.25fr_1fr]">
        <Panel title={`Journal entry ${draftedEntry.id.toUpperCase()}`} aiType="assisted">
          <div className="flex flex-col gap-6">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-body sm:grid-cols-3">
              <div className="col-span-2 flex flex-col gap-0.5 sm:col-span-3">
                <dt className="text-small text-ink-muted">Memo</dt>
                <dd className="text-ink">{draftedEntry.memo}</dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-small text-ink-muted">Entity</dt>
                <dd className="text-ink">{entity.shortName}</dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-small text-ink-muted">Entry date</dt>
                <dd className="tabular text-ink">{dateLabel(draftedEntry.date)}</dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-small text-ink-muted">Auto-reverses</dt>
                <dd className="tabular text-ink">{dateLabel(draftedEntry.reversesOn)}</dd>
              </div>
            </dl>

            <div className="overflow-x-auto rounded-control border border-rule">
              <table className="w-full text-body">
                <thead>
                  <tr className="border-b border-rule bg-surface-sunken text-left text-small text-ink-muted">
                    <th className="px-4 py-2.5 font-medium">Account</th>
                    <th className="px-4 py-2.5 text-right font-medium">Debit</th>
                    <th className="px-4 py-2.5 text-right font-medium">Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {draftedEntry.lines.map((line) => (
                    <tr key={line.account} className="border-b border-rule">
                      <td className="px-4 py-3">
                        <span className="tabular text-ink-muted">{line.account}</span>{" "}
                        <span className="text-ink">{line.accountName}</span>
                      </td>
                      <td className="tabular px-4 py-3 text-right text-ink">
                        {line.debit ? formatCurrency(amount) : "–"}
                      </td>
                      <td className="tabular px-4 py-3 text-right text-ink">
                        {line.credit ? formatCurrency(amount) : "–"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-[4px] border-double border-rule-strong font-semibold">
                    <td className="px-4 py-3 text-ink">Total</td>
                    <td className="tabular px-4 py-3 text-right text-ink">{formatCurrency(amount)}</td>
                    <td className="tabular px-4 py-3 text-right text-ink">{formatCurrency(amount)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <p className="-mt-3 text-small text-ink-muted">
              Debits equal credits.
              {entry.edited &&
                ` You changed the amount from ${formatCurrency(drafted)} to ${formatCurrency(amount)}.`}
            </p>

            {entry.status === "draft" && !editing && (
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => update((s) => ({ ...s, entry: { ...s.entry, status: "approved" } }))}>
                  Approve and post entry
                </Button>
                <Button variant="secondary" onClick={startEdit}>
                  Edit amount
                </Button>
              </div>
            )}

            {entry.status === "draft" && editing && (
              <form
                className="flex flex-col gap-3 rounded-control border border-rule bg-row-hover p-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  saveEdit()
                }}
              >
                <label htmlFor="amount" className="text-small font-medium text-ink">
                  Accrual amount (applies to both lines)
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="relative">
                    <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-muted">
                      $
                    </span>
                    <input
                      id="amount"
                      inputMode="decimal"
                      autoFocus
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      aria-invalid={!!error}
                      aria-describedby={error ? "amount-error" : "amount-hint"}
                      className={cn(
                        "tabular h-10 w-44 rounded-control border bg-surface pr-3 pl-7 text-right text-body text-ink",
                        error ? "border-negative" : "border-rule-strong"
                      )}
                    />
                  </span>
                  <Button type="submit">Save amount</Button>
                  <Button type="button" variant="secondary" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                </div>
                {error ? (
                  <p id="amount-error" className="text-small text-negative">{error}</p>
                ) : (
                  <p id="amount-hint" className="text-small text-ink-muted">
                    PO-5562 was billed above contract. At the contract rate the total is{" "}
                    <button
                      type="button"
                      className="tabular text-ink underline underline-offset-4"
                      onClick={() => setInput(contractAdjusted.toFixed(2))}
                    >
                      {formatCurrency(contractAdjusted)}
                    </button>
                    .
                  </p>
                )}
              </form>
            )}

            {entry.status === "approved" && (
              <div className="flex flex-col gap-4">
                <StatusNote tone="success">
                  <p>
                    <span className="font-medium">Entry approved and posted</span> to{" "}
                    {entity.name}. It reverses automatically on{" "}
                    {dateLabel(draftedEntry.reversesOn)}.
                  </p>
                </StatusNote>
                <AuditTrail edited={entry.edited} amount={amount} />
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant="destructive"
                    onClick={() => update((s) => ({ ...s, entry: { ...s.entry, status: "reversed" } }))}
                  >
                    Reverse entry
                  </Button>
                  <span className="text-small text-ink-muted">
                    You can reverse it until the September books are locked.
                  </span>
                </div>
              </div>
            )}

            {entry.status === "reversed" && (
              <div className="flex flex-col gap-3">
                <StatusNote tone="info">
                  <p>
                    <span className="font-medium">Entry reversed.</span> It stays in the
                    log, marked as reversed. This counts as a miss for accrual
                    drafting at {entity.shortName}, so that task&apos;s accuracy
                    score goes down.
                  </p>
                </StatusNote>
                <Button
                  variant="secondary"
                  className="self-start"
                  onClick={() => update((s) => ({ ...s, entry: { ...s.entry, status: "draft" } }))}
                >
                  Review the draft again
                </Button>
              </div>
            )}
          </div>
        </Panel>

        <Panel title="Why I drafted this">
          <div className="flex flex-col gap-5">
            <p className="max-w-[72ch] text-body text-ink">{draftedEntry.reasoning}</p>
            <div className="flex flex-col gap-1.5">
              <ConfidenceMeter value={draftedEntry.confidence} threshold={task.promotionThreshold} />
              <p className="text-small text-ink-muted">
                The mark is the {task.promotionThreshold}% accuracy accrual drafting
                needs before it can move to Automated.
              </p>
            </div>
            <EvidenceList items={draftedEntry.evidence} />
            <div className="flex flex-col gap-1 border-t border-rule pt-4 text-small text-ink-muted">
              <p>{draftedEntry.comparableHistory}</p>
              <p className="tabular">
                {task.name} at {entity.shortName} is Assisted: {lastMonth.correct} of{" "}
                {lastMonth.proposed} drafts were right in September.
              </p>
            </div>
          </div>
        </Panel>
      </div>

      <NextStepBar
        {...stepTargets("finance", "assisted-fix")}
        hint={
          entry.status === "approved"
            ? "Entry posted and logged. You can reverse it until September is locked."
            : "Nothing posts until you approve. Edit the amount first if needed."
        }
      />
    </div>
  )
}

function AuditTrail({ edited, amount }: { edited: boolean; amount: number }) {
  const rows = [
    { who: "AI", what: `Drafted the accrual for ${formatCurrency(drafted)} (medium confidence, ${draftedEntry.confidence}%)` },
    ...(edited
      ? [{ who: "You", what: `Changed the amount to ${formatCurrency(amount)}` }]
      : []),
    { who: "You", what: "Approved and posted the entry" },
  ]
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-small font-medium text-ink-muted">Activity log</h3>
      <ol className="flex flex-col border-l border-rule-strong pl-4">
        {rows.map((r, i) => (
          <li key={i} className="flex gap-3 py-1 text-small">
            <span className="w-8 shrink-0 font-medium text-ink">{r.who}</span>
            <span className="tabular text-ink-muted">{r.what}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
