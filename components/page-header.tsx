import { IllustrativeData } from "./illustrative-data"
import { StatusLine } from "./status-line"

// Page title plus the in-product status line that tells the user what state
// they're looking at. Keep both as real product copy, never narration.
export function PageHeader({
  title,
  status,
  description,
  illustrative = true,
}: {
  title: string
  status?: React.ReactNode[]
  description?: React.ReactNode
  illustrative?: boolean
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
      <div className="flex max-w-[80ch] flex-col gap-2">
        <h1 className="text-h1 text-ink max-sm:text-[24px] max-sm:leading-[30px]">
          {title}
        </h1>
        {status && <StatusLine items={status} />}
        {description && <p className="max-w-[72ch] text-body text-ink-muted">{description}</p>}
      </div>
      {illustrative && <IllustrativeData className="sm:pt-2" />}
    </div>
  )
}
