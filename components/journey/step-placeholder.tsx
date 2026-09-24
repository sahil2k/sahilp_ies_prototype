import { notFound } from "next/navigation"
import { Clock } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { company, entities } from "@/data/company"
import { findStep, journeys, type JourneyId } from "@/data/journeys"
import { NextStepBar, stepTargets } from "./next-step-bar"

// Screen that isn't available yet. It still carries a real title, status line
// and navigation, and shows a product-style "coming soon" state.
export function StepPlaceholder({
  journeyId,
  slug,
}: {
  journeyId: JourneyId
  slug: string
}) {
  const found = findStep(journeyId, slug)
  if (!found) notFound()
  const { step } = found

  return (
    <>
      <PageHeader
        title={step.title}
        status={[`Sandbox: ${company.groupName}`, `${entities.length} entities`]}
        description={step.summary}
        illustrative={false}
      />
      <div className="mt-8 flex flex-col items-start gap-2 rounded-panel border border-dashed border-rule-strong bg-surface p-6">
        <Clock aria-hidden className="size-5 text-ink-muted" />
        <p className="text-h3 text-ink">Coming soon</p>
        <p className="max-w-[60ch] text-body text-ink-muted">
          {step.title} isn&apos;t available in your workspace yet. We&apos;ll let you
          know when it is.
        </p>
      </div>
      <NextStepBar {...stepTargets(journeyId, slug)} />
    </>
  )
}

export function stepParams(journeyId: JourneyId) {
  return journeys[journeyId].steps.map((s) => ({ step: s.slug }))
}
