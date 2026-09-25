// Illustrative mock data for the developer journey. Ridgeline Software and
// Flowcast are fictional, same as Cedarline Group. Flowcast's sandbox
// customer is Cedarline Group (see data/company.ts), so the entities and the
// Cold Storage cash-risk example carry across both personas.

import type { ActionType } from "./company"

export const isv = {
  name: "Ridgeline Software",
  hq: "Austin, TX",
  founded: 2019,
}

export type AgentAction = { id: string; type: ActionType; text: string }

// Flowcast's identity: fixed everywhere, never editable (it's referenced as
// a proper noun outside the editable screens — hub cards, Revenue's status
// line — which don't read from the agent-config store).
export const agent = {
  id: "flowcast",
  name: "Flowcast",
}

// Flowcast's listing content and declared actions: the editable part. This
// is the seed/default; lib/agent-store.ts holds the live, editable copy
// that Agent Studio writes to and Marketplace listing reads from.
export const agentListingDefaults = {
  tagline: "Multi-entity cash flow forecasting",
  category: "Cash & treasury",
  description:
    "Flowcast pulls cash balances across a customer's whole group, drafts a rolling 13-week forecast, and flags entities headed for a shortfall.",
  pricePerMonth: 220,
  actions: [
    {
      id: "cash-shortfall",
      type: "automated",
      text: "Pulls daily bank balances across every connected entity and flags any entity projected to dip below its minimum cash threshold within 2 weeks.",
    },
    {
      id: "rolling-forecast",
      type: "assisted",
      text: "Drafts a 13-week rolling cash forecast for each entity and the consolidated group. The controller reviews assumptions before it's shared.",
    },
    {
      id: "intercompany-handoff",
      type: "handoff",
      text: "When a forecast shows a shortfall that needs an intercompany transfer, hands the numbers to the customer's finance team rather than acting on it.",
    },
  ] satisfies AgentAction[],
}

export const maxDeclaredActions = 5

// Historical billing uses this fixed price, independent of the live,
// editable price in the agent-config store — past months don't change
// retroactively just because today's listing price changes.
const billedPricePerMonth = agentListingDefaults.pricePerMonth

// A "today vs group-level" comparison for the API explorer. Real figures
// (partner tiers, one-connection-per-entity limits) come from
// CASE_CONTEXT.md section 8 and carry their source; this comparison is
// illustrative code, not a researched claim.
export const apiComparison = {
  before: {
    label: "Today: one connection per entity",
    code: `for (const entityId of groupEntityIds) {
  const res = await ies.get(
    \`/v1/companies/\${entityId}/balances\`,
    { headers: { Authorization: \`Bearer \${tokens[entityId]}\` } }
  )
  balances[entityId] = res.data
}
// No endpoint returns the consolidated position or
// intercompany transfers between entities.`,
  },
  after: {
    label: "Group-Level API: one connection for the whole group",
    code: `const res = await ies.get(
  \`/v1/groups/\${groupId}/cash-position\`,
  { headers: { Authorization: \`Bearer \${groupToken}\` } }
)
// Returns every entity's balance, the consolidated
// total, and pending intercompany transfers.`,
  },
}

export const cashPositionEndpoint = {
  method: "GET",
  path: "/v1/groups/cedarline-group/cash-position",
}

// Sample response for the API explorer. Cold Storage is the same entity
// flagged "Needs attention" on the finance side, at risk here too.
export const cashPositionResponse = {
  groupId: "cedarline-group",
  asOf: "2026-10-02",
  consolidated: { balance: 1_842_300.55, currency: "USD" },
  entities: [
    { entityId: "chi", name: "Cedarline Holdings, Inc.", balance: 612_400.1, minimumThreshold: 100_000 },
    { entityId: "cfr", name: "Cedarline Freight LLC", balance: 398_150.0, minimumThreshold: 75_000 },
    {
      entityId: "ccs",
      name: "Cedarline Cold Storage LLC",
      balance: 41_920.35,
      minimumThreshold: 50_000,
      atRisk: true,
    },
    { entityId: "cft", name: "Cedarline Freight Texas LLC", balance: 289_760.0, minimumThreshold: 60_000 },
    { entityId: "cfs", name: "Cedarline Fleet Services LLC", balance: 210_540.1, minimumThreshold: 40_000 },
    { entityId: "cda", name: "Cedarline Distribution Arizona LLC", balance: 289_530.0, minimumThreshold: 50_000 },
  ],
  intercompanyTransfersPending: 1,
}

export const agentTestRun = {
  entityId: "ccs",
  entityName: "Cedarline Cold Storage LLC",
  balance: 41_920.35,
  minimumThreshold: 50_000,
  daysToShortfall: 9,
}

// Cedarline Group is one of Flowcast's real installs (see revenueHistory),
// not a separate made-up example. Shown on the connecting screen and in the
// finance close's own activity log.
export const cedarlineInstall = {
  installedOn: "2026-09-14",
  actionTimestamp: "2026-10-01T22:40:00",
}

export const listing = {
  publishedOn: "2026-04-02",
  securityReview: { passed: true, reviewedOn: "2026-03-28" },
  communityTrust: {
    ratings: 34,
    ratingsThreshold: 50,
    trustworthyPercent: 91,
    trustworthyThreshold: 85,
  },
}

export function trustEligible() {
  const { ratings, ratingsThreshold, trustworthyPercent, trustworthyThreshold } = listing.communityTrust
  return ratings >= ratingsThreshold && trustworthyPercent >= trustworthyThreshold
}

export const revenueSplit = { platformFeePercent: 30, developerSharePercent: 70 }
const perInstallMonthly = Math.round(billedPricePerMonth * (revenueSplit.developerSharePercent / 100))

export type RevenueMonth = { month: string; activeInstalls: number }

const installsByMonth = [6, 22, 51, 88, 126, 168]
export const revenueHistory: RevenueMonth[] = [
  "2026-04",
  "2026-05",
  "2026-06",
  "2026-07",
  "2026-08",
  "2026-09",
].map((month, i) => ({ month, activeInstalls: installsByMonth[i] }))

/** The developer's 70% share for one month. */
export function monthRevenue(m: RevenueMonth) {
  return m.activeInstalls * perInstallMonthly
}

/** The full amount billed to customers for one month, before the platform fee. */
export function monthGross(m: RevenueMonth) {
  return m.activeInstalls * billedPricePerMonth
}

export const currentMonth = revenueHistory[revenueHistory.length - 1]
export const lifetimeRevenue = revenueHistory.reduce((sum, m) => sum + monthRevenue(m), 0)
export const lifetimeGross = revenueHistory.reduce((sum, m) => sum + monthGross(m), 0)

export const nextPayout = {
  amount: monthRevenue(currentMonth),
  date: "2026-10-15",
  method: "Direct deposit, monthly",
}
