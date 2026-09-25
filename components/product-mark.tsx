import Link from "next/link"
import { cn } from "@/lib/utils"

export const PRODUCT_NAME = "Concert"

// A tick above an accountant's double rule: the sign that something has
// been checked and totalled.
export function ProductMark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-2 rounded-control", className)}
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="size-7 shrink-0"
        fill="none"
      >
        <rect width="24" height="24" rx="4" className="fill-ink" />
        <path
          d="M7 10.5l3 3 7-7"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M6 16.5h12M6 19h12" stroke="white" strokeWidth="1.25" />
      </svg>
      <span className="text-body font-semibold text-ink">{PRODUCT_NAME}</span>
    </Link>
  )
}
