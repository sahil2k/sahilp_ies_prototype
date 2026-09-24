import { cn } from "@/lib/utils"

// Citation for a real research figure (CASE_CONTEXT.md section 8), distinct
// from IllustrativeData: this marks a figure as sourced fact, not a
// disclosure that the figure is fictional.
export function SourceNote({
  source,
  type,
  className,
}: {
  source: string
  type: string
  className?: string
}) {
  return (
    <p className={cn("text-small text-ink-muted", className)}>
      Source: {source} ({type}).
    </p>
  )
}
