import { Hub } from "@/components/journey/hub"
import { ReadinessMini } from "@/components/readiness-dial"
import { closeSummary, company, entities } from "@/data/company"

export default function Page() {
  return (
    <Hub
      journeyId="finance"
      status={[
        `${company.groupName}, ${entities.length} entities`,
        `${company.closePeriod} close, workday ${company.closeWorkday} of ${company.closeTargetWorkdays}`,
        <ReadinessMini key="readiness" value={closeSummary.readinessScore} label="Readiness" />,
        `${closeSummary.totalExceptions} open exceptions`,
      ]}
    />
  )
}
