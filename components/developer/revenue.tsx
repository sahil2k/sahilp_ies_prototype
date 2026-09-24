import { NextStepBar, stepTargets } from "@/components/journey/next-step-bar"
import { PageHeader } from "@/components/page-header"
import { Panel } from "@/components/panel"
import {
  agent,
  currentMonth,
  lifetimeGross,
  lifetimeRevenue,
  monthGross,
  monthRevenue,
  nextPayout,
  revenueHistory,
  revenueSplit,
} from "@/data/developer"
import { monthName } from "@/lib/confidence"
import { formatCurrency, formatNumber } from "@/lib/format"

const dateLabel = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

export function Revenue() {
  const thisMonthRevenue = monthRevenue(currentMonth)
  const thisMonthGross = monthGross(currentMonth)

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Revenue"
        status={[
          agent.name,
          `${formatNumber(currentMonth.activeInstalls)} active installs`,
          `Next payout ${formatCurrency(nextPayout.amount)} on ${dateLabel(nextPayout.date)}`,
        ]}
        description={`Revenue share is calculated per active install: ${revenueSplit.developerSharePercent}% to you, ${revenueSplit.platformFeePercent}% platform fee.`}
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Active installs" value={formatNumber(currentMonth.activeInstalls)} />
        <Stat
          label="This month, your share"
          value={formatCurrency(thisMonthRevenue)}
          caption={`of ${formatCurrency(thisMonthGross)} total billed`}
        />
        <Stat
          label="Lifetime, your share"
          value={formatCurrency(lifetimeRevenue)}
          caption={`of ${formatCurrency(lifetimeGross)} total billed`}
        />
        <Stat label="Your split" value={`${revenueSplit.developerSharePercent}%`} />
      </div>

      <Panel title="Installs and revenue by month" bodyClassName="p-0 md:p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-body">
            <thead>
              <tr className="border-b border-rule bg-surface-sunken text-left text-small text-ink-muted">
                <th className="px-4 py-2.5 font-medium md:px-6">Month</th>
                <th className="px-4 py-2.5 text-right font-medium md:px-6">Active installs</th>
                <th className="px-4 py-2.5 text-right font-medium md:px-6">Total billed</th>
                <th className="px-4 py-2.5 text-right font-medium md:px-6">
                  Your share ({revenueSplit.developerSharePercent}%)
                </th>
              </tr>
            </thead>
            <tbody>
              {revenueHistory.map((m) => (
                <tr key={m.month} className="border-b border-rule last:border-b-0">
                  <td className="px-4 py-3 text-ink md:px-6">{monthName(m.month, "long")}</td>
                  <td className="tabular px-4 py-3 text-right text-ink md:px-6">
                    {formatNumber(m.activeInstalls)}
                  </td>
                  <td className="tabular px-4 py-3 text-right text-ink-muted md:px-6">
                    {formatCurrency(monthGross(m))}
                  </td>
                  <td className="tabular px-4 py-3 text-right text-ink md:px-6">
                    {formatCurrency(monthRevenue(m))}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-[4px] border-double border-rule-strong font-semibold">
                <td className="px-4 py-3 text-ink md:px-6">Lifetime</td>
                <td className="px-4 py-3 md:px-6" />
                <td className="tabular px-4 py-3 text-right text-ink-muted md:px-6">
                  {formatCurrency(lifetimeGross)}
                </td>
                <td className="tabular px-4 py-3 text-right text-ink md:px-6">
                  {formatCurrency(lifetimeRevenue)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Panel>

      <Panel title="Next payout">
        <dl className="grid grid-cols-2 gap-4 text-body sm:grid-cols-3">
          <div className="flex flex-col gap-0.5">
            <dt className="text-small text-ink-muted">Amount</dt>
            <dd className="tabular text-ink">{formatCurrency(nextPayout.amount)}</dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-small text-ink-muted">Date</dt>
            <dd className="tabular text-ink">{dateLabel(nextPayout.date)}</dd>
          </div>
          <div className="col-span-2 flex flex-col gap-0.5 sm:col-span-1">
            <dt className="text-small text-ink-muted">Method</dt>
            <dd className="text-ink">{nextPayout.method}</dd>
          </div>
        </dl>
      </Panel>

      <NextStepBar
        {...stepTargets("developer", "monetisation")}
        hint="See Flowcast's badges working inside a customer's close."
      />
    </div>
  )
}

function Stat({ label, value, caption }: { label: string; value: string; caption?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-panel border border-rule bg-surface p-4">
      <span className="text-small text-ink-muted">{label}</span>
      <span className="tabular text-h2 text-ink">{value}</span>
      {caption && <span className="tabular text-small text-ink-muted">{caption}</span>}
    </div>
  )
}
