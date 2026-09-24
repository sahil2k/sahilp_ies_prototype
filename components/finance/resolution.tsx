"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ActionBadge } from "@/components/action-badge"
import { ConfidenceMeter } from "@/components/confidence-meter"
import { NextStepBar, stepTargets } from "@/components/journey/next-step-bar"
import { PageHeader } from "@/components/page-header"
import { Panel } from "@/components/panel"
import { ReadinessDial, ReadinessMini } from "@/components/readiness-dial"
import { StatusNote } from "@/components/status-note"
import { Button } from "@/components/ui/button"
import {
  closeSummary,
  entities,
  entityById,
  experts,
  taxQuestion,
  type Expert,
} from "@/data/company"
import { stepHref } from "@/data/journeys"
import { formatCurrency } from "@/lib/format"
import { setHandoff, useHandoff } from "@/lib/handoff-store"
import { derive } from "./derived"
import { useFinance } from "./finance-state"

const entity = entityById(taxQuestion.entityId)!
const answer = taxQuestion.expertAnswer
const before = closeSummary.readinessScore

// The finance area's one orchestrated moment (docs/design.md 9): when the item
// closes, the readiness score counts up and the dial fills to its new value.
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
  const handoff = useHandoff()
  const d = derive(state)
  const answered = handoff.status === "sent"
  const closed = answered && state.resolution === "closed"
  const [justClosed, setJustClosed] = useState(false)
  const score = useCountUp(closed ? d.readiness : before, before, justClosed)
  const expert = experts.find((e) => e.id === handoff.expertId) ?? experts[0]

  const closeItem = () => {
    setJustClosed(true)
    update((s) => ({ ...s, resolution: "closed" }))
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Multi-state tax review"
        status={
          answered
            ? [
                entity.name,
                "Arizona tax question",
                `Answered by ${expert.name}, ${expert.credential}`,
                closed ? "Closed" : "Accrual awaiting your approval",
              ]
            : [
                entity.name,
                "Arizona tax question",
                <span key="unreviewed" className="font-semibold text-warning">
                  Not reviewed by an expert
                </span>,
                `Low confidence, ${taxQuestion.confidence}%`,
              ]
        }
      />

      <div className="grid items-start gap-6 lg:grid-cols-[1.25fr_1fr]">
        <div className="flex flex-col gap-6">
          {answered ? (
            <ExpertAnswer expert={expert} closed={closed} onClose={closeItem} />
          ) : (
            <UnreviewedDraft expert={expert} declined={handoff.status === "declined"} />
          )}
        </div>

        <div className="flex flex-col gap-6">
          <Panel title="Close readiness">
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <ReadinessDial value={score} />
              <dl className="grid w-full grid-cols-2 gap-4 text-body sm:grid-cols-1 sm:gap-3">
                <div className="flex flex-col gap-0.5">
                  <dt className="text-small text-ink-muted">{entity.shortName}</dt>
                  <dd>
                    <ReadinessMini value={closed ? d.entityReadiness(entity.id) : entity.closeReadiness} />
                    {closed && (
                      <span className="tabular ml-2 text-small text-ink-muted">
                        up from {entity.closeReadiness}
                      </span>
                    )}
                  </dd>
                </div>
                <div className="flex flex-col gap-0.5">
                  <dt className="text-small text-ink-muted">Group</dt>
                  <dd className="tabular text-ink">
                    {closed ? `Up from ${before}` : "This item is still open"}
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
            ) : answered ? (
              <p className="text-body text-ink-muted">
                When you close this item, I&apos;ll add the expert&apos;s answer to my
                training and show what changed here.
              </p>
            ) : (
              <p className="text-body text-ink-muted">
                Nothing yet. I only learn from answers an expert has reviewed, not
                from my own unreviewed drafts.
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
            : answered
              ? "Approve the accrual to close this item."
              : "Unreviewed draft. Ask an expert to resolve this item."
        }
      />
    </div>
  )
}

function ExpertAnswer({
  expert,
  closed,
  onClose,
}: {
  expert: Expert
  closed: boolean
  onClose: () => void
}) {
  return (
    <>
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
            Accrue Arizona transaction privilege tax on the 29 invoices delivered to
            Arizona addresses in August and September.
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
                  <td className="tabular px-4 py-3 text-right text-ink">
                    {formatCurrency(answer.accrualAmount)}
                  </td>
                  <td className="px-4 py-3 text-right text-ink">–</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">
                    <span className="tabular text-ink-muted">2235</span>{" "}
                    <span className="text-ink">Sales tax payable, Arizona</span>
                  </td>
                  <td className="px-4 py-3 text-right text-ink">–</td>
                  <td className="tabular px-4 py-3 text-right text-ink">
                    {formatCurrency(answer.accrualAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {!closed ? (
            <Button onClick={onClose} className="self-start max-sm:w-full">
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
    </>
  )
}

function UnreviewedDraft({ expert, declined }: { expert: Expert; declined: boolean }) {
  return (
    <>
      <StatusNote tone="warning">
        <p>Unreviewed AI draft. Don&apos;t use it for filing or accrual decisions.</p>
        <p className="font-normal">
          {declined
            ? "You chose not to send this question to an expert. "
            : "This question hasn't been sent to an expert. "}
          My confidence is {taxQuestion.confidence}%, and multi-state tax is
          regulated.
        </p>
      </StatusNote>

      <Panel
        title="My draft answer"
        aside={<ConfidenceMeter value={taxQuestion.confidence} compact />}
        className="border-l-[3px] border-l-warning"
      >
        <div className="flex flex-col gap-4">
          <p className="max-w-[72ch] text-body text-ink">{taxQuestion.aiDraft}</p>
          <ConfidenceMeter value={taxQuestion.confidence} />
          <dl className="flex flex-col text-body">
            <div className="flex flex-col gap-0.5 border-b border-rule pb-3">
              <dt className="text-small text-ink-muted">What I couldn&apos;t determine</dt>
              <dd className="text-ink">
                Where customers took delivery of the 29 orders shipped to Arizona
                addresses. That decides which sales are taxable.
              </dd>
            </div>
            <div className="flex flex-col gap-0.5 pt-3">
              <dt className="text-small text-ink-muted">What I haven&apos;t done</dt>
              <dd className="text-ink">
                I haven&apos;t drafted an accrual. Without knowing which sales are
                taxable, any amount would be a guess.
              </dd>
            </div>
          </dl>
        </div>
      </Panel>

      <Panel title="Ask an expert" aiType="handoff">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2 rounded-control border border-rule p-4">
            <span className="flex flex-col gap-0.5">
              <span className="text-body font-medium text-ink">
                {expert.name}, {expert.credential}
              </span>
              <span className="text-small text-ink-muted">{expert.specialty}</span>
              <span className="text-small text-ink-muted">{expert.typicalResponse}</span>
            </span>
            <span className="flex flex-col sm:items-end">
              <span className="tabular text-h3 text-ink">
                {formatCurrency(expert.pricePerQuestion)}
              </span>
              <span className="text-small text-ink-muted">per question</span>
            </span>
          </div>
          <p className="tabular text-body text-ink">
            You pay <span className="font-semibold">{formatCurrency(expert.pricePerQuestion)}</span>{" "}
            for this one question. No retainer or subscription.
            <span className="block text-small text-ink-muted">
              Illustrative price. Charged once, when you confirm.
            </span>
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <Button
              onClick={() => setHandoff({ status: "sent" })}
              className="max-sm:w-full max-sm:whitespace-normal"
            >
              Confirm and send to {expert.name}
            </Button>
            <Link
              href={stepHref("finance", "expert-handoff")}
              className="text-small text-ink underline underline-offset-4"
            >
              Compare experts
            </Link>
          </div>
        </div>
      </Panel>
    </>
  )
}
