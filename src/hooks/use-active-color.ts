"use client"

import { useHoverSlug } from "@/components/wow/hover-provider"
import type { WowClassSlug } from "@/config/wow/classes"

export function classColor(slug: WowClassSlug | null | undefined): string | undefined {
  if (!slug) return undefined
  return `var(--color-class-${slug})`
}

export function useActiveColor(defaultSlug: WowClassSlug): string {
  const { slug: hoverSlug } = useHoverSlug()
  const activeSlug = (hoverSlug ?? defaultSlug) as WowClassSlug
  return `var(--color-class-${activeSlug})`
}
