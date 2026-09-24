import { FinanceStateProvider } from "@/components/finance/finance-state"
import { ExpertHandoff } from "@/components/finance/expert-handoff"

// Each screen gets its own fresh state from /data, so it renders the same
// whether opened from the Finance hub or from the previous screen.
export default function Page() {
  return (
    <FinanceStateProvider>
      <ExpertHandoff />
    </FinanceStateProvider>
  )
}
