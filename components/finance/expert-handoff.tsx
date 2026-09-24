"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { ActionBadge } from "@/components/action-badge"
import { ConfidenceMeter } from "@/components/confidence-meter"
import { NextStepBar, stepTargets } from "@/components/journey/next-step-bar"
import { PageHeader } from "@/components/page-header"
import { Panel } from "@/components/panel"
import { StatusNote } from "@/components/status-note"
import { Button } from "@/components/ui/button"
import {
  entityById,
  experts,
  taxQuestion,
  type ActionType,
  type Expert,
} from "@/data/company"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useFinance } from "./finance-state"

const entity = entityById(taxQuestion.entityId)!

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

export function ExpertHandoff() {
  const { state, update } = useFinance()
  const [comparing, setComparing] = useState(false)
  const { handoff } = state
  const sent = handoff.status === "sent"
  const expert = experts.find((e) => e.id === handoff.expertId) ?? experts[0]
  const current = sent ? 2 : 1

  const choose = (id: string) =>
    update((s) => ({ ...s, handoff: { ...s.handoff, expertId: id } }))

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Multi-state tax review"
        status={[
          entity.name,
          "Arizona tax question",
          `Low confidence, ${taxQuestion.confidence}%`,
          sent ? `Sent to ${expert.name}` : "Expert recommended, not booked",
        ]}
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
        <Panel title="Expert recommended" aiType="handoff">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <h3 className="text-small font-medium text-ink-muted">Question</h3>
              <p className="max-w-[72ch] text-body text-ink">{taxQuestion.question}</p>
            </div>

            <div className="flex flex-col gap-2 rounded-control bg-surface-sunken p-4">
              <h3 className="text-small font-medium text-ink-muted">
                My draft answer
              </h3>
              <p className="max-w-[72ch] text-body text-ink">{taxQuestion.aiDraft}</p>
              <ConfidenceMeter value={taxQuestion.confidence} className="mt-1" />
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-small font-medium text-ink-muted">
                Why I&apos;m recommending an expert
              </h3>
              <ul className="flex flex-col gap-1.5">
                {taxQuestion.whyHandoff.map((reason) => (
                  <li key={reason} className="flex gap-2 text-body text-ink">
                    <span aria-hidden className="mt-[9px] size-1.5 shrink-0 rounded-full bg-handoff" />
                    {reason}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-4 border-t border-rule pt-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-h3 text-ink">
                  {sent ? "Sent to" : "Recommended expert"}
                </h3>
                {!sent && (
                  <Button
                    variant="quiet"
                    size="sm"
                    className="h-auto"
                    aria-expanded={comparing}
                    onClick={() => setComparing((c) => !c)}
                  >
                    {comparing ? "Hide other experts" : `Compare ${experts.length} experts`}
                  </Button>
                )}
              </div>

              {!comparing || sent ? (
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
                        onChange={() => choose(x.id)}
                        className="mt-1 size-4 accent-ink"
                      />
                      <ExpertDetails expert={x} />
                    </label>
                  ))}
                </fieldset>
              )}

              {!sent ? (
                <div className="flex flex-col gap-3">
                  <p className="tabular text-body text-ink">
                    You pay{" "}
                    <span className="font-semibold">
                      {formatCurrency(expert.pricePerQuestion)}
                    </span>{" "}
                    for this one question. No retainer or subscription.
                    <span className="block text-small text-ink-muted">
                      Illustrative price. Charged once, when you confirm.
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={() =>
                        update((s) => ({ ...s, handoff: { ...s.handoff, status: "sent" } }))
                      }
                      className="max-sm:w-full max-sm:whitespace-normal"
                    >
                      Confirm and send to {expert.name}
                    </Button>
                    {handoff.status !== "declined" && (
                      <Button
                        variant="secondary"
                        onClick={() =>
                          update((s) => ({ ...s, handoff: { ...s.handoff, status: "declined" } }))
                        }
                      >
                        Not now
                      </Button>
                    )}
                  </div>
                  {handoff.status === "declined" && (
                    <StatusNote tone="info">
                      <p>
                        Kept in your exception queue. The AI&apos;s draft answer is
                        not used and no one has been booked.
                      </p>
                    </StatusNote>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <StatusNote tone="success">
                    <p>
                      <span className="font-medium">
                        Sent to {expert.name}, {expert.credential}.
                      </span>{" "}
                      {formatCurrency(expert.pricePerQuestion)} for this question.
                      Typical response: {expert.typicalResponse.toLowerCase()}.
                      You&apos;ll be notified when the answer arrives.
                    </p>
                  </StatusNote>
                  <Button
                    variant="quiet"
                    size="sm"
                    className="h-auto self-start"
                    onClick={() =>
                      update((s) => ({ ...s, handoff: { ...s.handoff, status: "pending" } }))
                    }
                  >
                    Undo send
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Panel>

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
      </div>

      <NextStepBar
        {...stepTargets("finance", "expert-handoff")}
        hint={
          sent
            ? `Sent to ${expert.name}. You'll be notified when the answer arrives.`
            : "Nothing is booked or charged until you confirm."
        }
      />
    </div>
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
