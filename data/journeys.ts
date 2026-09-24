// Screens for each persona. Every screen can be opened directly from its hub;
// the order drives the step indicator and the Next/Back controls for anyone
// walking the sequence.

import type { ActionType } from "./company"

export type JourneyId = "finance" | "developer"

export type JourneyStep = {
  slug: string
  title: string
  summary: string // one line, shown on the hub card
  nextLabel: string // label for the button that leads *to* this step
  actionTypes: ActionType[] // AI action types this screen features
}

export type Journey = {
  id: JourneyId
  name: string // workspace name shown in the header
  hubTitle: string
  hubLabel: string // link back to the hub
  steps: JourneyStep[]
}

export const journeys: Record<JourneyId, Journey> = {
  finance: {
    id: "finance",
    name: "Cedarline Group",
    hubTitle: "Finance",
    hubLabel: "Finance home",
    steps: [
      {
        slug: "close-dashboard",
        title: "Close dashboard",
        summary:
          "Close readiness across all 6 entities, and everything the AI has done this month.",
        nextLabel: "Open the close dashboard",
        actionTypes: ["automated", "assisted", "handoff"],
      },
      {
        slug: "exception-queue",
        title: "Exception queue",
        summary:
          "Items that need a person, plus tasks ready to be promoted to Automated or moved back to Assisted.",
        nextLabel: "Review exceptions",
        actionTypes: ["automated", "assisted", "handoff"],
      },
      {
        slug: "assisted-fix",
        title: "Assisted fix",
        summary:
          "A drafted freight accrual for Cold Storage, with the AI's reasoning, evidence and confidence.",
        nextLabel: "Review drafted entry",
        actionTypes: ["assisted"],
      },
      {
        slug: "expert-handoff",
        title: "Expert handoff",
        summary:
          "An Arizona tax question recommended for a multi-state tax CPA, priced before you confirm.",
        nextLabel: "Review the tax question",
        actionTypes: ["handoff"],
      },
      {
        slug: "resolution",
        title: "Resolution",
        summary:
          "The expert's answer, the accrual drafted from it, and what the AI learned for next time.",
        nextLabel: "See the expert's answer",
        actionTypes: ["handoff", "assisted"],
      },
    ],
  },
  developer: {
    id: "developer",
    name: "Developer platform",
    hubTitle: "Developer platform",
    hubLabel: "Developer home",
    steps: [
      {
        slug: "discovery",
        title: "Discovery",
        summary: "One connection for a customer's whole group of entities, not one per entity.",
        nextLabel: "Open the developer portal",
        actionTypes: [],
      },
      {
        slug: "onboarding",
        title: "Onboarding",
        summary:
          "Try a cross-entity request in the API explorer and open a multi-entity sandbox.",
        nextLabel: "Try the group-level API",
        actionTypes: [],
      },
      {
        slug: "agent-studio",
        title: "Agent Studio",
        summary:
          "Build a hosted agent and declare which of its actions are Automated, Assisted or Human handoff.",
        nextLabel: "Build an agent",
        actionTypes: ["automated", "assisted", "handoff"],
      },
      {
        slug: "publishing",
        title: "Publishing",
        summary: "Your marketplace listing, security review and Community trusted status.",
        nextLabel: "Publish the agent",
        actionTypes: [],
      },
      {
        slug: "monetisation",
        title: "Monetisation",
        summary: "Active installs, revenue share and your next payout.",
        nextLabel: "See revenue",
        actionTypes: [],
      },
    ],
  },
}

export const connectingScreen = {
  href: "/together",
  title: "Agents in your close",
  summary:
    "Marketplace agents working inside the finance close, labelled the same way as built-in agents.",
  nextLabel: "See agents in your close",
}

export function hubHref(journeyId: JourneyId) {
  return `/${journeyId}`
}

export function stepHref(journeyId: JourneyId, slug: string) {
  return `/${journeyId}/${slug}`
}

export function findStep(journeyId: JourneyId, slug: string) {
  const steps = journeys[journeyId].steps
  const index = steps.findIndex((s) => s.slug === slug)
  if (index === -1) return null
  return {
    step: steps[index],
    index,
    total: steps.length,
    prev: index > 0 ? steps[index - 1] : null,
    next: index < steps.length - 1 ? steps[index + 1] : null,
  }
}
