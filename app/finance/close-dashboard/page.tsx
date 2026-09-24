import { FinanceStateProvider } from "@/components/finance/finance-state"
import { CloseDashboard } from "@/components/finance/close-dashboard"

// Each screen gets its own fresh state from /data, so it renders the same
// whether opened from the Finance hub or from the previous screen.
export default function Page() {
  return (
    <FinanceStateProvider>
      <CloseDashboard />
    </FinanceStateProvider>
  )
}
