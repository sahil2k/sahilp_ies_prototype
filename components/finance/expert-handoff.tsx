"use client"

import { useEffect, useRef, useState } from "react"
import { Check, Star } from "lucide-react"
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
  type ActionType,
  type Expert,
} from "@/data/company"
import { formatCurrency } from "@/lib/format"
import { setHandoff, useHandoff } from "@/lib/handoff-store"
import { cn } from "@/lib/utils"
import { derive } from "./derived"
import { useFinance } from "./finance-state"

const entity = entityById(taxQuestion.entityId)!
const answer = taxQuestion.expertAnswer
const before = closeSummary.readinessScore

const stages: { title: string; type: ActionType; detail: string }[] = [
  {
    title: "Flagged",
    type: "automated",
    detail: "I scored my draft answer and checked the topic.",
  },
  {
    title: "You decide",
    type: "assisted",
    detail: "Check the expert and price. Nothing is booked until you confirm.",
  },
  {
    title: "Sent with context",
    type: "automated",
    detail: "Your data is packaged and routed. You don't re-explain anything.",
  },
]

// This screen's one orchestrated moment (docs/design.md 9): when the item
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

export function ExpertHandoff() {
  const { state, update } = useFinance()
  const handoff = useHandoff()
  const d = derive(state)
  const [comparing, setComparing] = useState(false)
  const answered = handoff.status === "sent"
  const closed = answered && state.resolution === "closed"
  const [justClosed, setJustClosed] = useState(false)
  const score = useCountUp(closed ? d.readiness : before, before, justClosed)
  const expert = experts.find((e) => e.id === handoff.expertId) ?? experts[0]
  const current = answered ? 2 : 1

  const closeItem = () => {
    setJustClosed(true)
    update((s) => ({ ...s, resolution: "closed" }))
  }
  const choose = (id: string) => setHandoff({ expertId: id })

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
                `Low confidence, ${taxQuestion.confidence}%`,
                "Expert recommended, not booked",
              ]
        }
      />

      <ol className="grid gap-3 md:grid-cols-3" aria-label="How a handoff works">
        {stages.map((s, i) => (
          <li
            key={s.title}
            aria-current={i === current ? "step" : undefined}
            className={cn(
              "flex flex-col gap-1.5 rounded-panel border bg-surface px-4 py-3",
              i === current ? "border-ink" : "border-rule",
              i > current && "opacity-60"
            )}
          >
            <span className="flex items-center justify-between gap-2">
              <span className="text-body font-medium text-ink">
                <span className="tabular text-ink-muted">{i + 1}.</span> {s.title}
                {i < current && <span className="sr-only"> (done)</span>}
              </span>
              <ActionBadge type={s.type} />
            </span>
            <span className="text-small text-ink-muted">{s.detail}</span>
          </li>
        ))}
      </ol>

      <div className="grid items-start gap-6 lg:grid-cols-[1.25fr_1fr]">
        <div className="flex flex-col gap-6">
          {!answered ? (
            <RecommendationPanels
              expert={expert}
              comparing={comparing}
              onToggleCompare={() => setComparing((c) => !c)}
              onChoose={choose}
              declined={handoff.status === "declined"}
            />
          ) : (
            <>
              <Panel
                title="My draft answer"
                aiType="handoff"
                aside={<ConfidenceMeter value={taxQuestion.confidence} compact />}
              >
                <div className="flex flex-col gap-3">
                  <p className="max-w-[72ch] text-body text-ink-muted">{taxQuestion.aiDraft}</p>
                  <p className="flex flex-wrap items-center gap-2 text-body text-ink">
                    <Check aria-hidden className="size-4 shrink-0 text-positive" />
                    Sent to {expert.name}, {expert.credential} ·{" "}
                    <span className="tabular">{formatCurrency(expert.pricePerQuestion)}</span>
                  </p>
                  <Button
                    variant="quiet"
                    size="sm"
                    className="h-auto self-start"
                    onClick={() => setHandoff({ status: "pending" })}
                  >
                    Undo send
                  </Button>
                </div>
              </Panel>
              <ExpertAnswer expert={expert} closed={closed} onClose={closeItem} />
            </>
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

          {answered ? (
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
          ) : (
            <Panel
              title="What the expert receives"
              aside={<span className="text-small text-ink-muted">Packaged automatically</span>}
            >
              <div className="flex flex-col gap-4">
                <dl className="flex flex-col">
                  {taxQuestion.contextPackage.map((item) => (
                    <div
                      key={item.label}
                      className="flex flex-col gap-0.5 border-b border-rule py-3 first:pt-0 last:border-b-0"
                    >
                      <dt className="text-small text-ink-muted">{item.label}</dt>
                      <dd className="tabular text-body text-ink">{item.detail}</dd>
                    </div>
                  ))}
                </dl>
                <p className="border-t border-rule pt-4 text-small text-ink-muted">
                  Topic: {taxQuestion.category}
                  {taxQuestion.regulated && " (regulated)"}. Experts are independent,
                  credentialed CPAs and advisory firms. They see only what&apos;s listed
                  here, and only for this question.
                </p>
              </div>
            </Panel>
          )}
        </div>
      </div>

      <NextStepBar
        {...stepTargets("finance", "expert-handoff")}
        hint={
          closed
            ? `Item closed. Close readiness is now ${d.readiness}/100.`
            : answered
              ? "Approve the accrual to close this item."
              : "Nothing is booked or charged until you confirm."
        }
      />
    </div>
  )
}

function RecommendationPanels({
  expert,
  comparing,
  onToggleCompare,
  onChoose,
  declined,
}: {
  expert: Expert
  comparing: boolean
  onToggleCompare: () => void
  onChoose: (id: string) => void
  declined: boolean
}) {
  return (
    <>
      {declined && (
        <StatusNote tone="warning">
          <p>Unreviewed AI draft. Don&apos;t use it for filing or accrual decisions.</p>
          <p className="font-normal">You chose not to send this question to an expert.</p>
        </StatusNote>
      )}

      <Panel
        title="My draft answer"
        aiType="handoff"
        aside={<ConfidenceMeter value={taxQuestion.confidence} compact />}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <h3 className="text-small font-medium text-ink-muted">Question</h3>
            <p className="max-w-[72ch] text-body text-ink">{taxQuestion.question}</p>
          </div>
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
              <dt className="text-small text-ink-muted">Why I&apos;m recommending an expert</dt>
              <dd className="flex flex-col gap-1.5 text-ink">
                {taxQuestion.whyHandoff.map((reason) => (
                  <span key={reason} className="flex gap-2">
                    <span aria-hidden className="mt-[9px] size-1.5 shrink-0 rounded-full bg-handoff" />
                    {reason}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
        </div>
      </Panel>

      <Panel title="Choose an expert">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-small font-medium text-ink-muted">Recommended</h3>
            <Button
              variant="quiet"
              size="sm"
              className="h-auto"
              aria-expanded={comparing}
              onClick={onToggleCompare}
            >
              {comparing ? "Hide other experts" : `Compare ${experts.length} experts`}
            </Button>
          </div>

          {!comparing ? (
            <ExpertCard expert={expert} />
          ) : (
            <fieldset className="flex flex-col gap-3">
              <legend className="mb-3 text-small text-ink-muted">
                Vetted experts licensed in Arizona, matched to this topic.
              </legend>
              {experts.map((x) => (
                <label
                  key={x.id}
                  className={cn(
                    "flex cursor-pointer gap-3 rounded-control border p-4",
                    x.id === expert.id
                      ? "border-ink bg-primary-tint"
                      : "border-rule hover:bg-row-hover"
                  )}
                >
                  <input
                    type="radio"
                    name="expert"
                    value={x.id}
                    checked={x.id === expert.id}
                    onChange={() => onChoose(x.id)}
                    className="mt-1 size-4 accent-ink"
                  />
                  <ExpertDetails expert={x} />
                </label>
              ))}
            </fieldset>
          )}

          <div className="flex flex-col gap-3 border-t border-rule pt-4">
            <p className="tabular text-body text-ink">
              You pay <span className="font-semibold">{formatCurrency(expert.pricePerQuestion)}</span>{" "}
              for this one question. No retainer or subscription.
              <span className="block text-small text-ink-muted">
                Illustrative price. Charged once, when you confirm.
              </span>
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => setHandoff({ status: "sent" })}
                className="max-sm:w-full max-sm:whitespace-normal"
              >
                Confirm and send to {expert.name}
              </Button>
              {!declined && (
                <Button variant="secondary" onClick={() => setHandoff({ status: "declined" })}>
                  Not now
                </Button>
              )}
            </div>
          </div>
        </div>
      </Panel>
    </>
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

function ExpertCard({ expert }: { expert: Expert }) {
  return (
    <div className="flex rounded-control border border-rule p-4">
      <ExpertDetails expert={expert} />
    </div>
  )
}

function ExpertDetails({ expert: x }: { expert: Expert }) {
  return (
    <span className="grid flex-1 gap-x-6 gap-y-2 sm:grid-cols-[1fr_auto]">
      <span className="flex flex-col gap-0.5">
        <span className="text-body font-medium text-ink">
          {x.name}, {x.credential}
        </span>
        <span className="text-small text-ink-muted">{x.specialty}</span>
        <span className="tabular text-small text-ink-muted">
          {x.yearsExperience} years. Licensed in {x.statesLicensed.join(", ")}.
        </span>
        <span className="tabular flex items-center gap-1 text-small text-ink-muted">
          <Star aria-hidden className="size-3.5 fill-ink-muted stroke-none" />
          {x.rating} from {x.questionsAnswered} answered questions
        </span>
      </span>
      <span className="flex flex-col gap-0.5 sm:items-end sm:text-right">
        <span className="tabular text-h3 text-ink">{formatCurrency(x.pricePerQuestion)}</span>
        <span className="text-small text-ink-muted">per question</span>
        <span className="text-small text-ink">{x.typicalResponse}</span>
      </span>
    </span>
  )
}
