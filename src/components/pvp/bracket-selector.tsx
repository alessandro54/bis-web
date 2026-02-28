"use client"

import Link from "next/link"
import { BRACKETS } from "@/config/wow/brackets"
import { useActiveColor } from "@/hooks/use-active-color"
import type { WowClassSlug } from "@/config/wow/classes"

type Props = {
  classSlug: WowClassSlug
  specSlug: string
  currentBracket: string
}

export function BracketSelector({ classSlug, specSlug, currentBracket }: Props) {
  const activeColor = useActiveColor(classSlug)

  return (
    <div className="flex gap-1">
      {BRACKETS.map((b) => {
        const isActive = b.slug === currentBracket
        return (
          <Link
            key={b.slug}
            href={`/${classSlug}/${specSlug}/pvp/${b.slug}`}
            className={`rounded px-2.5 py-1 text-xs font-medium transition-colors duration-700 ${isActive ? "class-pill" : "bracket-inactive"}`}
            style={{ "--pill-color": activeColor } as React.CSSProperties}
          >
            {b.label}
          </Link>
        )
      })}
    </div>
  )
}
