"use client"

import { useHoverSlug } from "./hover-provider"
import type { WowClassSlug } from "@/config/wow/classes"
import { cn } from "@/lib/utils"

type Props = {
  slug: WowClassSlug
  className?: string
  children: React.ReactNode
}

export function ClassHoverZone({ slug, className, children }: Props) {
  const { setSlug } = useHoverSlug()
  return (
    <div
      className={cn(className)}
      onMouseEnter={() => setSlug(slug)}
      onMouseLeave={() => setSlug(null)}
    >
      {children}
    </div>
  )
}
