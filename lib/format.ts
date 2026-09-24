// Finance number conventions from docs/design.md 4.3.

const currency = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Ledger format: $1,284,500.00, negatives as ($12,400.00), zero as an en dash. */
export function formatCurrency(value: number, { dash = false } = {}) {
  if (value === 0 && dash) return "–"
  const body = `$${currency.format(Math.abs(value))}`
  return value < 0 ? `(${body})` : body
}

/** Summary format: $1.28M, $18.4K. Show the full value in a tooltip. */
export function formatCompactCurrency(value: number) {
  const abs = Math.abs(value)
  const body =
    abs >= 1_000_000
      ? `$${(abs / 1_000_000).toFixed(2)}M`
      : abs >= 1_000
        ? `$${(abs / 1_000).toFixed(1)}K`
        : `$${abs.toFixed(0)}`
  return value < 0 ? `(${body})` : body
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value)
}

export function formatPercent(value: number, digits = 0) {
  return `${value.toFixed(digits)}%`
}
