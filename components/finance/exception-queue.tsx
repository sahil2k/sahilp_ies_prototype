"use client"

import Link from "next/link"
import { ActionBadge } from "@/components/action-badge"
import { ConfidenceMeter } from "@/components/confidence-meter"
import { NextStepBar, stepTargets } from "@/components/journey/next-step-bar"
import { PageHeader } from "@/components/page-header"
import { Panel } from "@/components/panel"
import { buttonVariants } from "@/components/ui/button"
import { automatedMiss, company, entityById, exceptions, type Exception } from "@/data/company"
import { stepHref } from "@/data/journeys"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"
import { DemotionPanel, PromotionPanel } from "./autonomy-panels"
import { derive } from "./derived"
import { type HandoffDecision, useHandoff } from "@/lib/handoff-store"
import { useFinance } from "./finance-state"

// The promotion and demotion prompts have their own panels, so leave them out
// of the table.
const queue = exceptions.filter((e) => e.id !== "exc-203" && e.id !== automatedMiss.exceptionId)

// Row status comes from /data, plus the shared expert handoff decision (an
// expert only has the question if the controller sent it).
function rowStatus(
  e: Exception,
  handoff: HandoffDecision["status"]
): { text: string; done?: boolean; href?: string; cta?: string } {
  if (e.id === "exc-201")
    return { text: "Draft ready for review", href: stepHref("finance", "assisted-fix"), cta: "Review draft" }
  if (e.id === "exc-202") {
    if (handoff === "sent")
      return { text: "With expert", href: stepHref("finance", "expert-handoff"), cta: "See answer" }
    return { text: "Expert recommended", href: stepHref("finance", "expert-handoff"), cta: "Review handoff" }
  }
  if (e.status === "resolved") return { text: "Resolved automatically", done: true }
  if (e.flag === "error") return { text: "Sent to your IT admin" }
  return { text: "Awaiting review" }
}

export function ExceptionQueue() {
  const { state } = useFinance()
  const handoff = useHandoff()
  const d = derive(state)
  const pendingDecisions =
    (state.promotion === "pending" ? 1 : 0) + (state.demotion === "pending" ? 1 : 0)

  const counts = queue.reduce(
    (acc, e) => ({ ...acc, [e.actionType]: acc[e.actionType] + 1 }),
    { automated: 0, assisted: 0, handoff: 0 }
  )

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Exception queue"
        status={[
          `${company.closePeriod} close`,
          `${d.openExceptions} open exceptions`,
          `${pendingDecisions} autonomy ${pendingDecisions === 1 ? "decision" : "decisions"} waiting`,
        ]}
      />

      <section aria-labelledby="autonomy-heading" className="flex flex-col gap-4">
        <div className="flex max-w-[72ch] flex-col gap-1">
          <h2 id="autonomy-heading" className="text-h2 text-ink">
            Earned autonomy
          </h2>
          <p className="text-body text-ink-muted">
            Tasks move between Assisted and Automated based on their accuracy at
            each entity. Nothing changes until you approve it.
          </p>
        </div>
        <PromotionPanel />
        <DemotionPanel />
      </section>

      <Panel
        title="Needs a person"
        aside={
          <span className="text-small text-ink-muted">
            Showing {queue.length} highest-priority items of {d.openExceptions}
          </span>
        }
        bodyClassName="p-0 md:p-0"
      >
        <p className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-rule px-4 py-3 text-small text-ink-muted md:px-6">
          {(["automated", "assisted", "handoff"] as const).map((t) => (
            <span key={t} className="flex items-center gap-2">
              <ActionBadge type={t} />
              <span className="tabular">{counts[t]}</span>
            </span>
          ))}
        </p>
        <ul>
          <li className="hidden grid-cols-[1fr_132px_120px_120px_176px] gap-4 border-b border-rule bg-surface-sunken px-6 py-2.5 text-small font-medium text-ink-muted lg:grid">
            <span>Item</span>
            <span>Label</span>
            <span>Confidence</span>
            <span className="text-right">Amount</span>
            <span className="text-right">Status</span>
          </li>
          {queue.map((e) => {
            const status = rowStatus(e, handoff.status)
            const entity = entityById(e.entityId)!
            const flagged = e.flag !== "none" && !status.done
            return (
              <li
                key={e.id}
                className={cn(
                  "grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 border-b border-rule px-4 py-3.5 last:border-b-0 md:px-6 lg:grid-cols-[1fr_132px_120px_120px_176px] lg:items-center",
                  flagged && "border-l-[3px] pl-[13px] md:pl-[21px]",
                  flagged && e.flag === "warning" && "border-l-warning bg-warning-tint",
                  flagged && e.flag === "error" && "border-l-negative bg-negative-tint",
                  status.done && "text-ink-muted"
                )}
              >
                <span className="col-span-2 flex flex-col gap-0.5 lg:col-span-1">
                  <span
                    className={cn(
                      "text-body",
                      status.done ? "text-ink-muted" : "font-medium text-ink"
                    )}
                  >
                    {e.title}
                  </span>
                  <span className="text-small text-ink-muted">
                    {entity.name.replace(/\.$/, "")}. {e.detail}
                  </span>
                  {flagged && (
                    <span
                      className={cn(
                        "text-small font-semibold",
                        e.flag === "warning" ? "text-warning" : "text-negative"
                      )}
                    >
                      {e.flag === "warning" ? "Material or unusual" : "Failed check"}
                    </span>
                  )}
                </span>
                <span className="flex items-center">
                  <ActionBadge type={e.actionType} />
                </span>
                <span className="flex items-center justify-end lg:justify-start">
                  {e.confidence > 0 ? (
                    <ConfidenceMeter value={e.confidence} compact />
                  ) : (
                    <span className="text-small text-ink-muted">–</span>
                  )}
                </span>
                <span className="tabular text-body text-ink lg:text-right">
                  {e.amount ? formatCurrency(e.amount) : "–"}
                </span>
                <span className="flex items-center justify-end">
                  {status.href ? (
                    <Link
                      href={status.href}
                      className={cn(buttonVariants({ size: "sm" }))}
                    >
                      {status.cta}
                    </Link>
                  ) : (
                    <span className="text-right text-small text-ink-muted">
                      {status.text}
                    </span>
                  )}
                </span>
              </li>
            )
          })}
        </ul>
      </Panel>

      <NextStepBar
        {...stepTargets("finance", "exception-queue")}
        hint={
          state.promotion === "pending" || state.demotion === "pending"
            ? `${pendingDecisions} autonomy ${pendingDecisions === 1 ? "decision" : "decisions"} waiting on you.`
            : "Up next: a drafted accrual for unbilled freight at Cold Storage."
        }
      />
    </div>
  )
}
