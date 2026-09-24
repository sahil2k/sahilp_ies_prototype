"use client"

import { useEffect, useRef, useState } from "react"
import { ActionBadge } from "@/components/action-badge"
import { NextStepBar, stepTargets } from "@/components/journey/next-step-bar"
import { PageHeader } from "@/components/page-header"
import { Panel } from "@/components/panel"
import { StatusNote } from "@/components/status-note"
import { Button } from "@/components/ui/button"
import { closeSummary, entities, entityById, experts, taxQuestion } from "@/data/company"
import { formatCurrency } from "@/lib/format"
import { derive } from "./derived"
import { useFinance } from "./finance-state"

const entity = entityById(taxQuestion.entityId)!
const answer = taxQuestion.expertAnswer
const before = closeSummary.readinessScore
// The expert the question was sent to, from /data.
const expert = experts.find((e) => e.id === taxQuestion.expertId)!

// The finance area's one orchestrated moment (docs/design.md 9): when the item
// closes, the readiness score counts up to its new value.
function useCountUp(target: number, from: number, animate: boolean) {
  const [value, setValue] = useState(target)
  const frame = useRef<number | null>(null)

  useEffect(() => {
    if (!animate) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce) return
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 600)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(from + (target - from) * eased))
      if (t < 1) frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current)
    }
  }, [target, from, animate])

  return animate ? value : target
}

export function Resolution() {
  const { state, update } = useFinance()
  const d = derive(state)
  const closed = state.resolution === "closed"
  const [justClosed, setJustClosed] = useState(false)
  const score = useCountUp(d.readiness, before, justClosed)

  const closeItem = () => {
    setJustClosed(true)
    update((s) => ({ ...s, resolution: "closed" }))
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Multi-state tax review"
        status={[
          entity.name,
          "Arizona tax question",
          `Answered by ${expert.name}, ${expert.credential}`,
          closed ? "Closed" : "Accrual awaiting your approval",
        ]}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[1.25fr_1fr]">
        <div className="flex flex-col gap-6">
          <Panel
            title={`Answer from ${expert.name}, ${expert.credential}`}
            aiType="handoff"
            aside={
              <span className="tabular text-small text-ink-muted">
                Answered in {answer.receivedAfter}
              </span>
            }
          >
            <div className="flex flex-col gap-4">
              <p className="max-w-[72ch] text-body text-ink">{answer.summary}</p>
              <div className="flex flex-col gap-2">
                <h3 className="text-small font-medium text-ink-muted">Recommended actions</h3>
                <ul className="flex flex-col gap-1.5">
                  {answer.recommendation.map((r) => (
                    <li key={r} className="flex gap-2 text-body text-ink">
                      <span aria-hidden className="mt-[9px] size-1.5 shrink-0 rounded-full bg-ink-muted" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Panel>

          <Panel title="Accrual drafted from the answer" aiType="assisted">
            <div className="flex flex-col gap-4">
              <p className="text-body text-ink">
                Accrue Arizona transaction privilege tax on the 29 invoices delivered
                to Arizona addresses in August and September.
              </p>
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
                    <tr className="border-b border-rule">
                      <td className="px-4 py-3">
                        <span className="tabular text-ink-muted">6410</span>{" "}
                        <span className="text-ink">Sales and use tax expense</span>
                      </td>
                      <td className="tabular px-4 py-3 text-right text-ink">{formatCurrency(answer.accrualAmount)}</td>
                      <td className="px-4 py-3 text-right text-ink">–</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">
                        <span className="tabular text-ink-muted">2235</span>{" "}
                        <span className="text-ink">Sales tax payable, Arizona</span>
                      </td>
                      <td className="px-4 py-3 text-right text-ink">–</td>
                      <td className="tabular px-4 py-3 text-right text-ink">{formatCurrency(answer.accrualAmount)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {!closed ? (
                <Button onClick={closeItem} className="self-start max-sm:w-full">
                  Approve accrual and close item
                </Button>
              ) : (
                <StatusNote tone="success">
                  <p>
                    <span className="font-medium">Accrual posted and item closed.</span>{" "}
                    Both are in the activity log and can be reversed.
                  </p>
                </StatusNote>
              )}
            </div>
          </Panel>
        </div>

        <div className="flex flex-col gap-6">
          <Panel title="Close readiness">
            <div className="flex flex-col gap-4">
              <div className="flex items-end gap-3">
                <span className="tabular text-display text-ink" aria-live="polite">
                  {score}
                </span>
                <span className="pb-1.5 text-body text-ink-muted">out of 100</span>
                {closed && (
                  <span className="tabular pb-1.5 text-body font-medium text-positive">
                    up from {before}
                  </span>
                )}
              </div>
              <div className="h-2 overflow-hidden rounded-[2px] bg-rule" aria-hidden>
                <div
                  className="h-full bg-ink transition-[width] duration-[600ms] ease-out"
                  style={{ width: `${score}%` }}
                />
              </div>
              <dl className="grid grid-cols-2 gap-4 text-body">
                <div className="flex flex-col gap-0.5">
                  <dt className="text-small text-ink-muted">{entity.shortName}</dt>
                  <dd className="tabular text-ink">
                    {closed
                      ? `${entity.closeReadiness} to ${d.entityReadiness(entity.id)}`
                      : entity.closeReadiness}
                  </dd>
                </div>
                <div className="flex flex-col gap-0.5">
                  <dt className="text-small text-ink-muted">Need a person</dt>
                  <dd className="tabular text-ink">{d.openExceptions} exceptions</dd>
                </div>
              </dl>
            </div>
          </Panel>

          <Panel title="What I learned">
            {closed ? (
              <div className="flex flex-col gap-4">
                <p className="text-body text-ink">{answer.agentLearning}</p>
                <dl className="flex flex-col text-body">
                  <div className="flex flex-col gap-0.5 border-b border-rule pb-3">
                    <dt className="text-small text-ink-muted">Before this answer</dt>
                    <dd className="text-ink">
                      I had no precedent in your group, and scored my own draft at{" "}
                      {taxQuestion.confidence}%.
                    </dd>
                  </div>
                  <div className="flex flex-col gap-0.5 pt-3">
                    <dt className="text-small text-ink-muted">From now on</dt>
                    <dd className="text-ink">
                      I&apos;ll use this answer as a reference for all {entities.length}{" "}
                      entities. Tax questions still go to an expert, because the topic
                      is regulated, but they&apos;ll arrive with a stronger draft.
                    </dd>
                  </div>
                </dl>
                <p className="flex flex-wrap items-center gap-2 text-small text-ink-muted">
                  Sales and use tax review stays <ActionBadge type="handoff" />
                </p>
              </div>
            ) : (
              <p className="text-body text-ink-muted">
                When you close this item, I&apos;ll add the expert&apos;s answer to my
                training and show what changed here.
              </p>
            )}
          </Panel>
        </div>
      </div>

      <NextStepBar
        {...stepTargets("finance", "resolution")}
        hint={
          closed
            ? `Item closed. Close readiness is now ${d.readiness}/100.`
            : "Approve the accrual to close this item."
        }
      />
    </div>
  )
}
