import { closeSummary, entities } from "@/data/company"
import type { FinanceState } from "./finance-state"

// Figures that change as the controller works through the journey.
export function derive(state: FinanceState) {
  const closed = state.resolution === "closed"
  const handled =
    (state.entry.status === "approved" ? 1 : 0) +
    (closed ? 1 : 0) +
    (state.promotion !== "pending" ? 1 : 0) +
    (state.demotion !== "pending" ? 1 : 0)

  const entityReadiness = (id: string) => {
    const entity = entities.find((e) => e.id === id)!
    return closed && id === "ccs"
      ? closeSummary.coldStorageReadinessAfterResolution
      : entity.closeReadiness
  }

  const entityExceptions = (id: string) => {
    const entity = entities.find((e) => e.id === id)!
    let n = entity.openExceptions
    if (id === "ccs") {
      if (state.entry.status === "approved") n -= 1
      if (closed) n -= 1
    }
    if (id === "cfr" && state.promotion !== "pending") n -= 1
    if (id === "chi" && state.demotion !== "pending") n -= 1
    return n
  }

  return {
    readiness: closed
      ? closeSummary.readinessAfterResolution
      : closeSummary.readinessScore,
    openExceptions: closeSummary.totalExceptions - handled,
    entityReadiness,
    entityExceptions,
  }
}
