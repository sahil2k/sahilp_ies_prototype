import { NextStepBar, stepTargets } from "@/components/journey/next-step-bar"
import { PageHeader } from "@/components/page-header"
import { Panel } from "@/components/panel"
import { SourceNote } from "@/components/source-note"
import { apiComparison } from "@/data/developer"
import { company, entities } from "@/data/company"

const available = [
  "Cross-entity reads across every connected entity",
  "Intercompany transactions, created and posted across entities",
  "Dimensions and custom fields, group-wide",
  "Consolidated reports in one call",
  "Group-level events and webhooks",
]

export function Discovery() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Group-Level API"
        status={[
          `Sandbox: ${company.groupName}`,
          `${entities.length} entities`,
          "One connection for the group",
        ]}
        description="One connection covers a customer's whole group of entities. Read and post across every entity a customer has connected, instead of authenticating with each one separately."
      />

      <Panel title="One connection instead of one per entity">
        <div className="grid gap-6 lg:grid-cols-2">
          <CodeBlock label={apiComparison.before.label} code={apiComparison.before.code} />
          <CodeBlock label={apiComparison.after.label} code={apiComparison.after.code} />
        </div>
        <div className="mt-6 flex flex-col gap-2 border-t border-rule pt-4">
          <SourceNote source="Intuit App Partner Program Guide" type="Primary" />
          <SourceNote source="Intuit IES developer FAQ" type="Primary" />
        </div>
      </Panel>

      <Panel title="What's available">
        <ul className="grid gap-3 sm:grid-cols-2">
          {available.map((item) => (
            <li key={item} className="flex gap-2 text-body text-ink">
              <span aria-hidden className="mt-[9px] size-1.5 shrink-0 rounded-full bg-ink-muted" />
              {item}
            </li>
          ))}
        </ul>
      </Panel>

      <NextStepBar
        {...stepTargets("developer", "discovery")}
        hint="Try a cross-entity request in the API explorer."
      />
    </div>
  )
}

function CodeBlock({ label, code }: { label: string; code: string }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-small font-medium text-ink-muted">{label}</h3>
      <pre className="overflow-x-auto rounded-control border border-rule bg-surface-sunken p-4">
        <code className="font-mono text-code text-ink">{code}</code>
      </pre>
    </div>
  )
}
