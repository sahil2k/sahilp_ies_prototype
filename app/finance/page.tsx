import { Hub } from "@/components/journey/hub"
import { closeSummary, company, entities } from "@/data/company"

export default function Page() {
  return (
    <Hub
      journeyId="finance"
      status={[
        `${company.groupName}, ${entities.length} entities`,
        `${company.closePeriod} close, workday ${company.closeWorkday} of ${company.closeTargetWorkdays}`,
        `Readiness ${closeSummary.readinessScore}/100`,
        `${closeSummary.totalExceptions} open exceptions`,
      ]}
    />
  )
}
