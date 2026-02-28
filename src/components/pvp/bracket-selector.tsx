"use client"

import Link from "next/link"
import { BRACKETS } from "@/config/wow/brackets"
import { useHoverSlug } from "@/components/wow/hover-provider"
import { getWowClassBySlug } from "@/lib/wow/classes"

type Props = {
  classSlug: string
  specSlug: string
  currentBracket: string
  defaultColor: string
}

export function BracketSelector({ classSlug, specSlug, currentBracket, defaultColor }: Props) {
  const { slug: hoverSlug } = useHoverSlug()
  const activeColor = hoverSlug ? (getWowClassBySlug(hoverSlug)?.color ?? defaultColor) : defaultColor

  return (
    <div className="flex gap-1">
      {BRACKETS.map((b) => {
        const isActive = b.slug === currentBracket
        return (
          <Link
            key={b.slug}
            href={`/${classSlug}/${specSlug}/pvp/${b.slug}`}
            className="rounded px-2.5 py-1 text-xs font-medium transition-colors duration-700"
            style={
              isActive
                ? { color: activeColor, backgroundColor: `${activeColor}22`, borderWidth: 1, borderStyle: "solid", borderColor: `${activeColor}66` }
                : { color: "var(--muted-foreground)" }
            }
          >
            {b.label}
          </Link>
        )
      })}
    </div>
  )
}
