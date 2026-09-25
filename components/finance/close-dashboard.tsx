"use client"

import { ActionBadge } from "@/components/action-badge"
import { ConfidenceMeter } from "@/components/confidence-meter"
import { NextStepBar, stepTargets } from "@/components/journey/next-step-bar"
import { PageHeader } from "@/components/page-header"
import { ReadinessDial, ReadinessMini } from "@/components/readiness-dial"
import { Panel } from "@/components/panel"
import { Button } from "@/components/ui/button"
import {
  activityLog,
  closeSummary,
  company,
  entities,
  entityById,
  type ActionType,
  type ActivityEntry,
} from "@/data/company"
import { agent, agentTestRun, cedarlineInstall, isv } from "@/data/developer"
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format"
import { cn } from "@/lib/utils"
import { derive } from "./derived"
import { useFinance } from "./finance-state"

// Flowcast's own flag, shown in the same activity log as Concert's built-in
// actions, in chronological order — the "one trust pattern" that /together
// also shows, made visible in the finance persona's actual home screen, not
// just on the capstone page. `source` marks it as third-party; native rows
// leave it undefined.
const flowcastEntry: ActivityEntry & { source?: string } = {
  id: "flowcast-cash-shortfall",
  timestamp: cedarlineInstall.actionTimestamp,
  entityId: agentTestRun.entityId,
  description: `Flagged ${agentTestRun.entityName}: balance ${formatCurrency(agentTestRun.balance)} is below its ${formatCurrency(agentTestRun.minimumThreshold)} minimum, projected in ${agentTestRun.daysToShortfall} days.`,
  actionType: "automated",
  confidence: null,
  reversible: true,
  source: `${agent.name}, from ${isv.name}`,
}

const fullActivityLog: (ActivityEntry & { source?: string })[] = [...activityLog]
fullActivityLog.splice(2, 0, flowcastEntry) // between Oct 2 7:52 AM and Oct 1 5:30 PM

const actionRows: { type: ActionType; count: number; note: string }[] = [
  {
    type: "automated",
    count: closeSummary.actionsByType.automated,
    note: "Done without review. Each one is logged and can be reversed.",
  },
  {
    type: "assisted",
    count: closeSummary.actionsByType.assisted,
    note: "Drafted by the AI and approved by your team.",
  },
  {
    type: "handoff",
    count: closeSummary.actionsByType.handoff,
    note: "Recommended for an expert or a person on your team.",
  },
]

const stateName = { CO: "Colorado", TX: "Texas", AZ: "Arizona" } as const

const monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

// Formatted from the string itself so server and browser always agree,
// whatever their time zones.
function formatTime(iso: string) {
  const [date, time] = iso.split("T")
  const [, m, day] = date.split("-").map(Number)
  const [h, min] = time.split(":").map(Number)
  const hour12 = h % 12 || 12
  return `${monthsShort[m - 1]} ${day}, ${hour12}:${String(min).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`
}

export function CloseDashboard() {
  const { state, update } = useFinance()
  const d = derive(state)
  const matchedRate =
    (closeSummary.bankLinesAutoMatched / closeSummary.bankLinesThisMonth) * 100

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Close dashboard"
        status={[
          `${company.closePeriod} close`,
          `${company.groupName}, ${entities.length} entities`,
          `Workday ${company.closeWorkday} of ${company.closeTargetWorkdays}`,
          <ReadinessMini key="readiness" value={d.readiness} label="Readiness" />,
          `${d.openExceptions} open exceptions`,
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Panel title="Close readiness">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
            <ReadinessDial value={d.readiness} />
            <dl className="grid w-full grid-cols-2 gap-4 text-body sm:grid-cols-1 sm:gap-3">
              <div className="flex flex-col gap-0.5">
                <dt className="text-small text-ink-muted">Close workday</dt>
                <dd className="tabular text-ink">
                  {company.closeWorkday} of a {company.closeTargetWorkdays}-day target
                </dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-small text-ink-muted">Last month&apos;s close</dt>
                <dd className="tabular text-ink">
                  {company.closeWorkdaysLastMonth} workdays
                </dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-small text-ink-muted">Need a person</dt>
                <dd className="tabular font-medium text-ink">
                  {d.openExceptions} exceptions
                </dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-small text-ink-muted">Intercompany eliminated</dt>
                <dd className="tabular text-ink">
                  {closeSummary.intercompanyEliminated} of{" "}
                  {closeSummary.intercompanyPairs} pairs
                </dd>
              </div>
            </dl>
          </div>
        </Panel>

        <Panel title="What the AI did this month">
          <div className="flex flex-col gap-4">
            <p className="text-body text-ink-muted">
              {formatNumber(closeSummary.aiActionsThisMonth)} actions across all
              entities, including {formatNumber(closeSummary.bankLinesAutoMatched)}{" "}
              of {formatNumber(closeSummary.bankLinesThisMonth)} bank lines matched (
              {formatPercent(matchedRate, 1)}).
            </p>
            <ul className="flex flex-col">
              {actionRows.map((row) => (
                <li
                  key={row.type}
                  className="grid grid-cols-[auto_1fr] items-start gap-x-4 gap-y-1 border-t border-rule py-3 sm:grid-cols-[132px_72px_1fr]"
                >
                  <span>
                    <ActionBadge type={row.type} />
                  </span>
                  <span className="tabular text-right text-body font-medium text-ink sm:text-right">
                    {formatNumber(row.count)}
                  </span>
                  <span className="col-span-2 text-small text-ink-muted sm:col-span-1 sm:pt-[3px]">
                    {row.note}
                  </span>
                </li>
              ))}
            </ul>
            <p className="border-t border-rule pt-3 text-small text-ink-muted">
              {closeSummary.aiActionsReversed + state.reversedActivity.length} actions
              reversed by your team this month. Every reversal lowers that
              task&apos;s accuracy score for that entity.
            </p>
          </div>
        </Panel>
      </div>

      <Panel title="Readiness by entity" bodyClassName="p-0 md:p-0">
        <EntityTable d={d} />
      </Panel>

      <Panel title="Recent AI activity" bodyClassName="p-0 md:p-0">
        <ul>
          <li className="hidden grid-cols-[120px_1fr_140px_110px_96px] gap-4 border-b border-rule bg-surface-sunken px-6 py-2.5 text-small font-medium text-ink-muted lg:grid">
            <span>When</span>
            <span>Action</span>
            <span>Label</span>
            <span>Confidence</span>
            <span className="text-right">Log</span>
          </li>
          {fullActivityLog.map((a) => {
            const reversedByYou = state.reversedActivity.includes(a.id)
            const reversed = !!a.reversedBy || reversedByYou
            const entity = a.entityId === "group" ? null : entityById(a.entityId)
            return (
              <li
                key={a.id}
                className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 border-b border-rule px-4 py-3 last:border-b-0 md:px-6 lg:grid-cols-[120px_1fr_140px_110px_96px] lg:items-center"
              >
                <span className="tabular order-2 text-small text-ink-muted lg:order-none">
                  {formatTime(a.timestamp)}
                </span>
                <span className="order-1 col-span-2 flex flex-col lg:order-none lg:col-span-1">
                  <span className={cn("text-body text-ink", reversed && "text-ink-muted line-through")}>
                    {a.description}
                  </span>
                  <span className="text-small text-ink-muted">
                    {a.source ?? (entity ? entity.name.replace(/\.$/, "") : "All entities")}
                    {reversed &&
                      `. Reversed by ${reversedByYou ? "you, just now" : a.reversedBy}`}
                  </span>
                </span>
                <span className="order-3 lg:order-none">
                  <ActionBadge type={a.actionType} />
                </span>
                <span className="order-4 lg:order-none">
                  {a.confidence !== null && <ConfidenceMeter value={a.confidence} compact />}
                </span>
                <span className="order-5 col-span-2 lg:order-none lg:col-span-1 lg:text-right">
                  {a.reversible && !reversed ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        update((s) => ({
                          ...s,
                          reversedActivity: [...s.reversedActivity, a.id],
                        }))
                      }
                    >
                      Reverse
                    </Button>
                  ) : reversedByYou ? (
                    <Button
                      variant="quiet"
                      size="sm"
                      onClick={() =>
                        update((s) => ({
                          ...s,
                          reversedActivity: s.reversedActivity.filter((id) => id !== a.id),
                        }))
                      }
                    >
                      Undo
                    </Button>
                  ) : (
                    <span className="text-small text-ink-muted">
                      {reversed ? "Reversed" : "Not reversible"}
                    </span>
                  )}
                </span>
              </li>
            )
          })}
        </ul>
      </Panel>

      <NextStepBar
        {...stepTargets("finance", "close-dashboard")}
        hint={`${d.openExceptions} items need a person, including 2 autonomy decisions.`}
      />
    </div>
  )
}

function EntityTable({ d }: { d: ReturnType<typeof derive> }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-body">
        <thead>
          <tr className="border-b border-rule bg-surface-sunken text-left text-small text-ink-muted">
            <th className="px-4 py-2.5 font-medium md:px-6">Entity</th>
            <th className="hidden px-4 py-2.5 font-medium sm:table-cell">State</th>
            <th className="px-4 py-2.5 font-medium">Readiness</th>
            <th className="px-4 py-2.5 text-right font-medium md:px-6">Open exceptions</th>
          </tr>
        </thead>
        <tbody>
          {entities.map((e) => {
            const readiness = d.entityReadiness(e.id)
            const low = readiness < 70
            return (
              <tr
                key={e.id}
                className={cn(
                  "border-b border-rule",
                  low ? "bg-warning-tint" : "hover:bg-row-hover"
                )}
              >
                <td className={cn("px-4 py-3 md:px-6", low && "border-l-[3px] border-l-warning pl-[13px] md:pl-[21px]")}>
                  <span className="text-ink sm:hidden">{e.shortName}</span>
                  <span className="hidden text-ink sm:inline">{e.name}</span>
                  {e.role === "parent" && (
                    <span className="ml-2 text-small text-ink-muted">Parent</span>
                  )}
                </td>
                <td className="hidden px-4 py-3 text-ink-muted sm:table-cell">{stateName[e.state]}</td>
                <td className="px-4 py-3">
                  <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <ReadinessMini value={readiness} />
                    {low && (
                      <span className="text-small font-semibold text-warning">
                        Needs attention
                      </span>
                    )}
                  </span>
                </td>
                <td className="tabular px-4 py-3 text-right text-ink md:px-6">
                  {d.entityExceptions(e.id) || "–"}
                </td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-[4px] border-double border-rule-strong font-semibold">
            <td className="px-4 py-3 text-ink md:px-6">Group</td>
            <td className="hidden px-4 py-3 sm:table-cell" />
            <td className="px-4 py-3">
              <ReadinessMini value={d.readiness} />
            </td>
            <td className="tabular px-4 py-3 text-right text-ink md:px-6">{d.openExceptions}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
