"use client"

import { ActionBadge } from "@/components/action-badge"
import { Panel } from "@/components/panel"
import { StatusNote } from "@/components/status-note"
import { TrackRecord } from "@/components/track-record"
import { Button } from "@/components/ui/button"
import {
  aiTasks,
  automatedMiss,
  company,
  entityById,
  type ActionType,
  type AiTask,
  type MissSignal,
} from "@/data/company"
import { accuracy, recentAccuracy } from "@/lib/confidence"
import { formatCurrency, formatNumber } from "@/lib/format"
import { useFinance } from "./finance-state"

// Earned Autonomy, both directions (CASE_CONTEXT.md F1): a task that has
// proven itself is offered promotion, and an Automated task that makes a
// material mistake is offered demotion. Neither change is ever automatic.

const promotionTask = aiTasks.find((t) => t.id === "task-bank-match-cfr")!
const promotionEntity = entityById(promotionTask.entityId)!
const missTask = aiTasks.find((t) => t.id === automatedMiss.taskId)!
const missEntity = entityById(automatedMiss.entityId)!

const signalLabel: Record<MissSignal, { name: string; detail: string }> = {
  reversal: {
    name: "Reversed by a person",
    detail: "Someone on your team undid or corrected the action.",
  },
  contradiction: {
    name: "Contradicted by a later record",
    detail: "A later payment, statement or reconciliation didn't agree with it.",
  },
  spot_check: {
    name: "Spot check",
    detail: `One of the ${company.spotCheckRate}% of Automated actions that a person still reviews.`,
  },
}

function TypeChange({ from, to }: { from: ActionType; to: ActionType }) {
  return (
    <span className="flex items-center gap-2 text-small text-ink-muted">
      <ActionBadge type={from} />
      <span aria-hidden>to</span>
      <span className="sr-only">change to</span>
      <ActionBadge type={to} />
    </span>
  )
}

function History({
  task,
  marked,
}: {
  task: AiTask
  marked?: { month: string; label: string }
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-small font-medium text-ink-muted">
          Monthly accuracy, last 6 months
        </h3>
        <span className="flex items-center gap-2 text-small text-ink-muted">
          <span className="size-3 rounded-[2px] bg-ink" aria-hidden />
          Met {task.promotionThreshold}%
        </span>
      </div>
      <TrackRecord
        history={task.history}
        threshold={task.promotionThreshold}
        marked={marked}
      />
    </div>
  )
}

function UndoButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="quiet" size="sm" className="h-auto self-start" onClick={onClick}>
      Undo
    </Button>
  )
}

export function PromotionPanel() {
  const { state, update } = useFinance()
  const track = recentAccuracy(promotionTask.history, promotionTask.monthsRequired)

  return (
    <Panel
      title={`${promotionTask.name} at ${promotionEntity.name} has earned promotion`}
      aside={<TypeChange from="assisted" to="automated" />}
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:gap-10">
        <div className="flex flex-col gap-4">
          <p className="text-h3 font-normal text-ink">
            {promotionTask.name}: {track.rate.toFixed(1)}% accurate over{" "}
            {promotionTask.monthsRequired} months. Promote to Automated?
          </p>
          <p className="tabular text-body text-ink-muted">
            {formatNumber(track.correct)} of {formatNumber(track.proposed)} matches
            were correct, above the {promotionTask.promotionThreshold}% threshold
            for {promotionTask.monthsRequired} months in a row. Once promoted,
            matches at this entity post without review.
          </p>
          <p className="text-small text-ink-muted">
            This applies to {promotionEntity.name} only. Bank matching at other
            entities keeps its own track record. {company.spotCheckRate}% of
            Automated matches are still spot-checked, and you&apos;ll be notified
            if one is wrong.
          </p>
        </div>
        <History task={promotionTask} />
      </div>

      <div className="mt-6 border-t border-rule pt-4">
        {state.promotion === "pending" && (
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => update((s) => ({ ...s, promotion: "promoted" }))}>
              Promote to Automated
            </Button>
            <Button
              variant="secondary"
              onClick={() => update((s) => ({ ...s, promotion: "kept" }))}
            >
              Keep as Assisted
            </Button>
          </div>
        )}
        {state.promotion === "promoted" && (
          <StatusNote tone="success">
            <p>
              <span className="font-medium">Promoted to Automated.</span> Bank
              matching at {promotionEntity.name} now runs without review. The
              change is in the activity log.
            </p>
            <UndoButton onClick={() => update((s) => ({ ...s, promotion: "pending" }))} />
          </StatusNote>
        )}
        {state.promotion === "kept" && (
          <StatusNote tone="info">
            <p>
              <span className="font-medium">Kept as Assisted.</span> You&apos;ll
              keep reviewing these matches. You&apos;ll be asked again after the
              October close.
            </p>
            <UndoButton onClick={() => update((s) => ({ ...s, promotion: "pending" }))} />
          </StatusNote>
        )}
      </div>
    </Panel>
  )
}

export function DemotionPanel() {
  const { state, update } = useFinance()
  const september = missTask.history.at(-1)!
  const septemberRate = accuracy(september)
  const belowThreshold = septemberRate < missTask.promotionThreshold
  const material = automatedMiss.amount > company.materialityThreshold
  const signal = signalLabel[automatedMiss.detectedBy]

  return (
    <Panel
      title={`${missTask.name} at ${missEntity.name} made a mistake`}
      aside={<TypeChange from="automated" to="assisted" />}
      className="border-l-[3px] border-l-warning"
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:gap-10">
        <div className="flex flex-col gap-4">
          <p className="text-h3 font-normal text-ink">
            An Automated elimination was wrong. Move {missTask.name.toLowerCase()}{" "}
            back to Assisted?
          </p>
          <p className="tabular text-body text-ink">{automatedMiss.whatHappened}</p>
          <dl className="grid gap-3 rounded-control bg-surface-sunken p-4 text-body sm:grid-cols-2">
            <div className="flex flex-col gap-0.5">
              <dt className="text-small text-ink-muted">How it was caught</dt>
              <dd className="text-ink">
                <span className="font-medium">{signal.name}.</span> {signal.detail}
              </dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-small text-ink-muted">What was fixed</dt>
              <dd className="text-ink">{automatedMiss.fixed}</dd>
            </div>
          </dl>
          <p className="tabular text-body font-semibold text-warning">
            {belowThreshold
              ? `September accuracy fell to ${septemberRate.toFixed(1)}%, below the ${missTask.promotionThreshold}% threshold.`
              : `September accuracy is ${septemberRate.toFixed(1)}%, still above the ${missTask.promotionThreshold}% threshold${
                  material
                    ? `, but ${formatCurrency(automatedMiss.amount)} is over your ${formatCurrency(company.materialityThreshold)} materiality limit, so I recommend moving it back to Assisted.`
                    : "."
                }`}
          </p>
          <p className="text-small text-ink-muted">
            Automated actions are checked three ways: reversals by your team,
            later records that contradict them, and spot checks on{" "}
            {company.spotCheckRate}% of actions. You&apos;re notified of every
            miss. I only recommend moving a task back when it falls below its
            threshold or the miss is material.
          </p>
        </div>
        <History
          task={missTask}
          marked={{ month: september.month, label: `${september.proposed - september.correct} miss` }}
        />
      </div>

      <div className="mt-6 border-t border-rule pt-4">
        {state.demotion === "pending" && (
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => update((s) => ({ ...s, demotion: "demoted" }))}>
              Move back to Assisted
            </Button>
            <Button
              variant="secondary"
              onClick={() => update((s) => ({ ...s, demotion: "kept" }))}
            >
              Keep Automated
            </Button>
          </div>
        )}
        {state.demotion === "demoted" && (
          <StatusNote tone="success">
            <p>
              <span className="font-medium">Moved back to Assisted.</span>{" "}
              Eliminations at {missEntity.shortName} will be drafted for your
              review. The task can earn Automated again after{" "}
              {missTask.monthsRequired} months at {missTask.promotionThreshold}% or
              above.
            </p>
            <UndoButton onClick={() => update((s) => ({ ...s, demotion: "pending" }))} />
          </StatusNote>
        )}
        {state.demotion === "kept" && (
          <StatusNote tone="info">
            <p>
              <span className="font-medium">Kept as Automated.</span> Spot checks
              continue at {company.spotCheckRate}%, and you&apos;ll be notified of
              any further misses.
            </p>
            <UndoButton onClick={() => update((s) => ({ ...s, demotion: "pending" }))} />
          </StatusNote>
        )}
      </div>
    </Panel>
  )
}
