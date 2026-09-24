// Illustrative mock data for the finance journey.
// Cedarline Group is fictional. Every figure here is invented for the prototype
// and must be shown with the "Illustrative data" label.

export type ActionType = "automated" | "assisted" | "handoff";
export type ConfidenceBand = "high" | "medium" | "low";
export type UsState = "CO" | "TX" | "AZ";

export type Entity = {
  id: string;
  name: string;
  shortName: string;
  role: "parent" | "operating";
  state: UsState;
  city: string;
  bankAccounts: number;
  closeReadiness: number; // 0–100
  openExceptions: number;
};

export type ReconciliationItem = {
  id: string;
  entityId: string;
  date: string; // ISO date
  description: string;
  amount: number; // negative = outflow
  matchedTo: string | null;
  actionType: ActionType;
  confidence: number; // 0–100
  status: "matched" | "suggested" | "unmatched";
};

export type Exception = {
  id: string;
  entityId: string;
  title: string;
  detail: string;
  amount: number;
  actionType: ActionType;
  confidence: number;
  flag: "none" | "warning" | "error";
  status: "open" | "in_review" | "with_expert" | "resolved";
  aiTaskId: string | null;
};

export type AccuracyMonth = {
  month: string; // YYYY-MM
  proposed: number;
  correct: number;
};

export type AiTask = {
  id: string;
  name: string;
  entityId: string;
  currentType: ActionType;
  promotionThreshold: number; // percent accuracy needed to earn Automated
  monthsRequired: number; // consecutive months at or above the threshold
  history: AccuracyMonth[];
};

export type JournalLine = {
  account: string;
  accountName: string;
  debit: number;
  credit: number;
};

export type Evidence = {
  label: string;
  passed: boolean | null; // null = informational source, not a check
};

export type DraftedEntry = {
  id: string;
  exceptionId: string;
  entityId: string;
  date: string;
  memo: string;
  lines: JournalLine[];
  reasoning: string;
  confidence: number;
  evidence: Evidence[];
  comparableHistory: string;
  reversesOn: string;
};

export type Expert = {
  id: string;
  name: string;
  credential: string;
  specialty: string;
  yearsExperience: number;
  statesLicensed: UsState[];
  questionsAnswered: number;
  rating: number; // out of 5
  pricePerQuestion: number;
  typicalResponse: string;
};

export type TaxQuestion = {
  id: string;
  exceptionId: string;
  entityId: string;
  category: string;
  regulated: boolean; // regulated categories always suggest a handoff
  question: string;
  aiDraft: string;
  confidence: number;
  whyHandoff: string[];
  contextPackage: { label: string; detail: string }[];
  expertId: string;
  expertAnswer: {
    receivedAfter: string;
    summary: string;
    recommendation: string[];
    accrualAmount: number;
    agentLearning: string;
  };
};

export type MissSignal = "reversal" | "contradiction" | "spot_check";

// An Automated action that turned out to be wrong. The controller is always
// notified; demotion back to Assisted is recommended only when the task falls
// below its threshold or the miss is material, and is never automatic.
export type AutomatedMiss = {
  id: string;
  exceptionId: string;
  taskId: string;
  entityId: string;
  counterpartEntityId: string;
  detectedBy: MissSignal;
  detectedOn: string;
  title: string;
  whatHappened: string;
  amount: number;
  originalConfidence: number;
  fixed: string;
};

export type ActivityEntry = {
  id: string;
  timestamp: string; // ISO datetime
  entityId: string | "group";
  description: string;
  actionType: ActionType;
  confidence: number | null;
  reversible: boolean;
  reversedBy?: string;
};

export const company = {
  groupName: "Cedarline Group",
  industry: "Regional freight and cold-chain logistics",
  employees: 640,
  headquarters: "Denver, CO",
  closePeriod: "September 2026",
  asOf: "2026-10-02",
  closeWorkday: 2,
  closeWorkdaysLastMonth: 9,
  closeTargetWorkdays: 4,
  // Share of Automated actions still sent to a person for review, so a
  // promoted task keeps producing a measurable accuracy figure.
  spotCheckRate: 4,
  // A miss above this amount is material: demotion is recommended even if
  // the task is still above its accuracy threshold.
  materialityThreshold: 10_000,
};

export const entities: Entity[] = [
  {
    id: "chi",
    name: "Cedarline Holdings, Inc.",
    shortName: "Holdings",
    role: "parent",
    state: "CO",
    city: "Denver",
    bankAccounts: 2,
    closeReadiness: 91,
    openExceptions: 2,
  },
  {
    id: "cfr",
    name: "Cedarline Freight LLC",
    shortName: "Freight CO",
    role: "operating",
    state: "CO",
    city: "Denver",
    bankAccounts: 3,
    closeReadiness: 84,
    openExceptions: 3,
  },
  {
    id: "ccs",
    name: "Cedarline Cold Storage LLC",
    shortName: "Cold Storage",
    role: "operating",
    state: "CO",
    city: "Aurora",
    bankAccounts: 2,
    closeReadiness: 66,
    openExceptions: 4,
  },
  {
    id: "cft",
    name: "Cedarline Freight Texas LLC",
    shortName: "Freight TX",
    role: "operating",
    state: "TX",
    city: "Dallas",
    bankAccounts: 2,
    closeReadiness: 79,
    openExceptions: 3,
  },
  {
    id: "cfs",
    name: "Cedarline Fleet Services LLC",
    shortName: "Fleet Services",
    role: "operating",
    state: "TX",
    city: "Houston",
    bankAccounts: 1,
    closeReadiness: 88,
    openExceptions: 1,
  },
  {
    id: "cda",
    name: "Cedarline Distribution Arizona LLC",
    shortName: "Distribution AZ",
    role: "operating",
    state: "AZ",
    city: "Phoenix",
    bankAccounts: 2,
    closeReadiness: 72,
    openExceptions: 2,
  },
];

export const closeSummary = {
  readinessScore: 78,
  readinessAfterResolution: 83,
  coldStorageReadinessAfterResolution: 81,
  totalExceptions: 15,
  bankLinesThisMonth: 4_812,
  bankLinesAutoMatched: 4_406,
  intercompanyPairs: 38,
  intercompanyEliminated: 35,
  aiActionsThisMonth: 5_371,
  aiActionsReversed: 6,
  // Breakdown of this month's AI actions by accountability type.
  actionsByType: { automated: 4_902, assisted: 461, handoff: 8 },
};

export const reconciliationItems: ReconciliationItem[] = [
  {
    id: "rec-1041",
    entityId: "cfr",
    date: "2026-09-28",
    description: "ACH deposit, Brightwater Grocers",
    amount: 48_210.0,
    matchedTo: "Invoice INV-20931",
    actionType: "automated",
    confidence: 99,
    status: "matched",
  },
  {
    id: "rec-1042",
    entityId: "cfr",
    date: "2026-09-29",
    description: "Wire out, Front Range Diesel Supply",
    amount: -22_874.5,
    matchedTo: "Bill B-7712",
    actionType: "automated",
    confidence: 98,
    status: "matched",
  },
  {
    id: "rec-1043",
    entityId: "ccs",
    date: "2026-09-29",
    description: "ACH deposit, Summit Fresh Co-op",
    amount: 12_960.0,
    matchedTo: "Invoice INV-20877 (partial)",
    actionType: "assisted",
    confidence: 81,
    status: "suggested",
  },
  {
    id: "rec-1044",
    entityId: "cft",
    date: "2026-09-30",
    description: "Card settlement, fuel network",
    amount: -9_318.42,
    matchedTo: "Fuel card statement, Sep",
    actionType: "automated",
    confidence: 97,
    status: "matched",
  },
  {
    id: "rec-1045",
    entityId: "cda",
    date: "2026-09-30",
    description: "Transfer from Cedarline Holdings",
    amount: 150_000.0,
    matchedTo: "Intercompany loan IC-0412",
    actionType: "automated",
    confidence: 99,
    status: "matched",
  },
  {
    id: "rec-1046",
    entityId: "cfs",
    date: "2026-09-30",
    description: "ACH debit, Lone Star Tire & Axle",
    amount: -6_402.18,
    matchedTo: "Bill B-7730",
    actionType: "assisted",
    confidence: 86,
    status: "suggested",
  },
  {
    id: "rec-1047",
    entityId: "ccs",
    date: "2026-09-30",
    description: "Wire out, Sonoran Logistics Park",
    amount: -18_750.0,
    matchedTo: null,
    actionType: "assisted",
    confidence: 54,
    status: "unmatched",
  },
];

export const aiTasks: AiTask[] = [
  {
    id: "task-bank-match-cfr",
    name: "Bank matching",
    entityId: "cfr",
    currentType: "assisted",
    promotionThreshold: 95,
    monthsRequired: 3,
    history: [
      { month: "2026-04", proposed: 1_102, correct: 1_031 },
      { month: "2026-05", proposed: 1_140, correct: 1_088 },
      { month: "2026-06", proposed: 1_175, correct: 1_139 },
      { month: "2026-07", proposed: 1_190, correct: 1_167 },
      { month: "2026-08", proposed: 1_214, correct: 1_192 },
      { month: "2026-09", proposed: 1_236, correct: 1_217 },
    ],
  },
  {
    id: "task-ic-elim",
    name: "Intercompany eliminations",
    entityId: "chi",
    currentType: "automated",
    promotionThreshold: 97,
    monthsRequired: 3,
    history: [
      { month: "2026-04", proposed: 34, correct: 33 },
      { month: "2026-05", proposed: 36, correct: 36 },
      { month: "2026-06", proposed: 35, correct: 35 },
      { month: "2026-07", proposed: 37, correct: 37 },
      { month: "2026-08", proposed: 38, correct: 38 },
      { month: "2026-09", proposed: 38, correct: 37 },
    ],
  },
  {
    id: "task-accruals-ccs",
    name: "Accrual drafting",
    entityId: "ccs",
    currentType: "assisted",
    promotionThreshold: 95,
    monthsRequired: 3,
    history: [
      { month: "2026-04", proposed: 14, correct: 11 },
      { month: "2026-05", proposed: 15, correct: 13 },
      { month: "2026-06", proposed: 16, correct: 14 },
      { month: "2026-07", proposed: 15, correct: 14 },
      { month: "2026-08", proposed: 17, correct: 15 },
      { month: "2026-09", proposed: 18, correct: 16 },
    ],
  },
  {
    id: "task-vendor-coding-cft",
    name: "Vendor bill coding",
    entityId: "cft",
    currentType: "assisted",
    promotionThreshold: 95,
    monthsRequired: 3,
    history: [
      { month: "2026-04", proposed: 402, correct: 371 },
      { month: "2026-05", proposed: 415, correct: 389 },
      { month: "2026-06", proposed: 398, correct: 377 },
      { month: "2026-07", proposed: 421, correct: 402 },
      { month: "2026-08", proposed: 433, correct: 409 },
      { month: "2026-09", proposed: 440, correct: 419 },
    ],
  },
  {
    id: "task-sales-tax",
    name: "Sales and use tax review",
    entityId: "group",
    currentType: "handoff",
    promotionThreshold: 99,
    monthsRequired: 6,
    history: [
      { month: "2026-07", proposed: 6, correct: 4 },
      { month: "2026-08", proposed: 7, correct: 5 },
      { month: "2026-09", proposed: 8, correct: 6 },
    ],
  },
];

export const exceptions: Exception[] = [
  {
    id: "exc-201",
    entityId: "ccs",
    title: "Unbilled cold-storage freight, September",
    detail:
      "Three purchase orders were received in September with no vendor bill yet.",
    amount: 18_400.0,
    actionType: "assisted",
    confidence: 88,
    flag: "warning",
    status: "open",
    aiTaskId: "task-accruals-ccs",
  },
  {
    id: "exc-202",
    entityId: "ccs",
    title: "Arizona warehouse: possible new tax obligation",
    detail:
      "Inventory has been stored at a Phoenix third-party warehouse since August 12.",
    amount: 18_750.0,
    actionType: "handoff",
    confidence: 58,
    flag: "warning",
    status: "open",
    aiTaskId: "task-sales-tax",
  },
  {
    id: "exc-203",
    entityId: "cfr",
    title: "Bank matching ready for promotion",
    detail: "3,576 of 3,640 matches correct over the last 3 months (98.2%).",
    amount: 0,
    actionType: "assisted",
    confidence: 98,
    flag: "none",
    status: "open",
    aiTaskId: "task-bank-match-cfr",
  },
  {
    id: "exc-204",
    entityId: "ccs",
    title: "Partial payment, Summit Fresh Co-op",
    detail: "$12,960.00 received against a $16,200.00 invoice.",
    amount: 12_960.0,
    actionType: "assisted",
    confidence: 81,
    flag: "none",
    status: "open",
    aiTaskId: null,
  },
  {
    id: "exc-205",
    entityId: "cft",
    title: "Tire and axle repair coded to fuel",
    detail: "Vendor usually coded to fleet maintenance.",
    amount: 6_402.18,
    actionType: "assisted",
    confidence: 86,
    flag: "none",
    status: "open",
    aiTaskId: "task-vendor-coding-cft",
  },
  {
    id: "exc-206",
    entityId: "chi",
    title: "Intercompany loan interest not mirrored",
    detail:
      "Holdings booked $1,125.00 of interest income; Distribution AZ has no matching expense.",
    amount: 1_125.0,
    actionType: "automated",
    confidence: 97,
    flag: "none",
    status: "resolved",
    aiTaskId: "task-ic-elim",
  },
  {
    id: "exc-207",
    entityId: "cft",
    title: "Fuel expense 31% above 6-month average",
    detail: "Driven by two new Dallas–Houston lanes added in September.",
    amount: 41_880.0,
    actionType: "assisted",
    confidence: 79,
    flag: "warning",
    status: "open",
    aiTaskId: "task-vendor-coding-cft",
  },
  {
    id: "exc-208",
    entityId: "cda",
    title: "Bank feed sync failed, operating account",
    detail: "The feed stopped on September 29. Two days of transactions are missing.",
    amount: 0,
    actionType: "handoff",
    confidence: 0,
    flag: "error",
    status: "open",
    aiTaskId: null,
  },
  {
    id: "exc-209",
    entityId: "chi",
    title: "Automated elimination was wrong",
    detail: "Found by a spot check. Demotion to Assisted recommended.",
    amount: 24_500.0,
    actionType: "automated",
    confidence: 96,
    flag: "warning",
    status: "open",
    aiTaskId: "task-ic-elim",
  },
];

export const automatedMiss: AutomatedMiss = {
  id: "miss-1001",
  exceptionId: "exc-209",
  taskId: "task-ic-elim",
  entityId: "chi",
  counterpartEntityId: "cft",
  detectedBy: "spot_check",
  detectedOn: "2026-10-01",
  title: "Automated elimination was wrong",
  whatHappened:
    "I eliminated a $24,500.00 management fee between Cedarline Holdings and Cedarline Freight Texas in September. Freight Texas booked the fee in October, so my elimination was a month early and understated September consolidated profit.",
  amount: 24_500.0,
  originalConfidence: 96,
  fixed:
    "The reviewer reversed the elimination and rebooked it in October. The reversal counts as a miss in September's track record.",
};

export const draftedEntry: DraftedEntry = {
  id: "je-0930-017",
  exceptionId: "exc-201",
  entityId: "ccs",
  date: "2026-09-30",
  memo: "Accrue unbilled freight for September receipts",
  lines: [
    {
      account: "6120",
      accountName: "Freight in",
      debit: 18_400.0,
      credit: 0,
    },
    {
      account: "2110",
      accountName: "Accrued liabilities",
      debit: 0,
      credit: 18_400.0,
    },
  ],
  reasoning:
    "I drafted an accrual of $18,400.00 for freight received in September but not yet billed. It's the sum of three open purchase orders from Halden Transport, each marked received in the warehouse system. One of them is billed above the contract rate, so check the amount before you approve.",
  confidence: 88,
  evidence: [
    { label: "PO-5531, received Sep 9, $6,200.00", passed: null },
    { label: "PO-5547, received Sep 18, $5,900.00", passed: null },
    { label: "PO-5562, received Sep 26, $6,300.00", passed: null },
    { label: "All three POs marked received in the warehouse system", passed: true },
    { label: "No vendor bill posted for any of the three POs", passed: true },
    { label: "PO-5562 rate differs from contract by 4%", passed: false },
  ],
  comparableHistory: "Similar freight accruals approved 23 of 24 times.",
  reversesOn: "2026-10-01",
};

export const experts: Expert[] = [
  {
    id: "exp-dw",
    name: "Dana Whitfield",
    credential: "CPA",
    specialty: "Multi-state sales, use and income tax",
    yearsExperience: 14,
    statesLicensed: ["AZ", "CO", "TX"],
    questionsAnswered: 312,
    rating: 4.9,
    pricePerQuestion: 180,
    typicalResponse: "Within 4 business hours",
  },
  {
    id: "exp-rm",
    name: "Rafael Moreno",
    credential: "CPA, CMI",
    specialty: "State tax nexus and voluntary disclosure",
    yearsExperience: 19,
    statesLicensed: ["AZ", "TX"],
    questionsAnswered: 204,
    rating: 4.8,
    pricePerQuestion: 220,
    typicalResponse: "Within 1 business day",
  },
];

export const taxQuestion: TaxQuestion = {
  id: "tq-0042",
  exceptionId: "exc-202",
  entityId: "ccs",
  category: "Multi-state tax",
  regulated: true,
  question:
    "Cedarline Cold Storage (Colorado) has stored inventory at a third-party warehouse in Phoenix since August 12. Does this create an Arizona tax obligation, and should we accrue anything for September?",
  aiDraft:
    "Storing inventory in Arizona may create physical presence there, which could require registering for Arizona transaction privilege tax. Whether September sales are taxable depends on where customers take delivery, which the available data does not show.",
  confidence: 58,
  whyHandoff: [
    "My confidence in the draft is 58%. Below 70%, I recommend an expert.",
    "Multi-state tax is regulated, so I recommend an expert for it whatever my confidence.",
    "Your group hasn't resolved a question like this before, so I have no precedent to check against.",
  ],
  contextPackage: [
    {
      label: "Entity",
      detail: "Cedarline Cold Storage LLC, Colorado, 2 bank accounts",
    },
    {
      label: "Warehouse contract",
      detail: "Sonoran Logistics Park, Phoenix, AZ, from August 12, 2026",
    },
    {
      label: "Related payments",
      detail: "2 wires to Sonoran Logistics Park, $18,750.00 each (Aug, Sep)",
    },
    {
      label: "Sales shipped from Phoenix",
      detail: "41 invoices in Aug–Sep, $96,300.00 total, 29 to Arizona addresses",
    },
    {
      label: "Current registrations",
      detail: "Colorado and Texas sales tax; no Arizona registration",
    },
    {
      label: "AI draft and confidence",
      detail: "Included in full, with confidence 58% (low)",
    },
  ],
  expertId: "exp-dw",
  expertAnswer: {
    receivedAfter: "3 hours 12 minutes",
    summary:
      "Yes. Holding inventory in a Phoenix warehouse gives Cold Storage physical presence in Arizona from August 12, so it should register for Arizona transaction privilege tax. Sales delivered to Arizona addresses from that date are taxable; sales delivered out of state are not.",
    recommendation: [
      "Register Cold Storage for Arizona transaction privilege tax this month.",
      "Accrue tax on the 29 Arizona-delivered invoices for August and September.",
      "Flag future inventory moves to a new state for review before they happen.",
    ],
    accrualAmount: 4_871.25,
    agentLearning:
      "I now treat inventory held in a new state as a physical-presence signal, and I'll flag it automatically for all 6 entities.",
  },
};

export const activityLog: ActivityEntry[] = [
  {
    id: "act-9001",
    timestamp: "2026-10-02T08:14:00",
    entityId: "group",
    description: "Eliminated 35 of 38 intercompany pairs across 6 entities",
    actionType: "automated",
    confidence: 99,
    reversible: true,
  },
  {
    id: "act-9002",
    timestamp: "2026-10-02T07:52:00",
    entityId: "cfr",
    description: "Matched 1,217 bank lines to invoices and bills",
    actionType: "assisted",
    confidence: 98,
    reversible: true,
  },
  {
    id: "act-9003",
    timestamp: "2026-10-01T17:30:00",
    entityId: "ccs",
    description: "Drafted a $18,400.00 accrual for unbilled freight",
    actionType: "assisted",
    confidence: 88,
    reversible: true,
  },
  {
    id: "act-9004",
    timestamp: "2026-10-01T16:05:00",
    entityId: "ccs",
    description: "Proposed sending an Arizona tax question to an expert",
    actionType: "handoff",
    confidence: 58,
    reversible: false,
  },
  {
    id: "act-9006",
    timestamp: "2026-09-30T23:10:00",
    entityId: "chi",
    description: "Eliminated a $24,500.00 management fee with Freight Texas",
    actionType: "automated",
    confidence: 96,
    reversible: true,
    reversedBy: "spot check, Oct 1",
  },
  {
    id: "act-9005",
    timestamp: "2026-09-30T11:20:00",
    entityId: "cft",
    description: "Recoded a fuel card batch to fleet maintenance",
    actionType: "assisted",
    confidence: 74,
    reversible: true,
    reversedBy: "Priya Nair, Sep 30",
  },
];

export function entityById(id: string) {
  return entities.find((e) => e.id === id);
}
