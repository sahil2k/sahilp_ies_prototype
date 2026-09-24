import { Hub } from "@/components/journey/hub"
import { company, entities } from "@/data/company"

export default function Page() {
  return (
    <Hub
      journeyId="developer"
      status={[
        `Sandbox: ${company.groupName}, ${entities.length} entities`,
        "Group-Level API",
        "Hosted agents",
      ]}
    />
  )
}
