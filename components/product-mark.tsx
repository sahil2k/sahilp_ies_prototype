import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

export const PRODUCT_NAME = "Concert"

export function ProductMark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-2 rounded-control", className)}
    >
      <Image
        src="/logo.png"
        alt=""
        width={31}
        height={36}
        className="h-7 w-auto shrink-0"
        priority
      />
      <span className="text-body font-semibold text-ink">{PRODUCT_NAME}</span>
    </Link>
  )
}
