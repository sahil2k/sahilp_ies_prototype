import type { AccuracyMonth, ConfidenceBand } from "@/data/company"

// Bands from docs/design.md 8.1.
export function confidenceBand(value: number): ConfidenceBand {
  if (value >= 90) return "high"
  if (value >= 70) return "medium"
  return "low"
}

export const bandLabel: Record<ConfidenceBand, string> = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
}

export function accuracy(month: AccuracyMonth) {
  return (month.correct / month.proposed) * 100
}

/** Combined accuracy over the most recent `months` months. */
export function recentAccuracy(history: AccuracyMonth[], months: number) {
  const recent = history.slice(-months)
  const proposed = recent.reduce((sum, m) => sum + m.proposed, 0)
  const correct = recent.reduce((sum, m) => sum + m.correct, 0)
  return { proposed, correct, rate: (correct / proposed) * 100 }
}

export function monthName(month: string, style: "short" | "long" = "short") {
  const [y, m] = month.split("-").map(Number)
  return new Date(y, m - 1, 1).toLocaleString("en-US", { month: style })
}
