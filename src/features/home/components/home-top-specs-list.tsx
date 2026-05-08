"use client"

import Image from "next/image"
import { TransitionLink as Link } from "@/components/atoms/transition-link"
import { TIER_COLORS } from "@/config/app-config"
import { titleizeSlug } from "@/lib/utils"

export interface TopSpecBracket {
  label: string
  slug: string
  tier: string
}

export interface TopSpecEntry {
  specName: string
  className: string
  wrHat: number
  iconUrl?: string
  color: string
  specUrl: string
  brackets: TopSpecBracket[]
}

const SHORT_BRACKET_LABELS: Record<string, string> = {
  "2v2": "2v2",
  "3v3": "3v3",
  shuffle: "Shuffle",
  blitz: "Blitz",
}

interface Props {
  specs: TopSpecEntry[]
}

export function HomeTopSpecsList({ specs }: Props) {
  if (specs.length === 0) return null

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Top Specs &middot; All Brackets
      </p>
      <div className="space-y-2">
        {specs.map((spec, i) => (
          <Link
            key={`${spec.specName}-${i}`}
            href={spec.specUrl}
            prefetch={false}
            className="group flex flex-col gap-1.5 rounded-xl border border-black/10 bg-black/[0.04] px-5 py-3.5 transition-all hover:border-black/15 hover:bg-black/[0.07] dark:border-white/[0.05] dark:bg-white/[0.02] dark:hover:border-white/[0.1] dark:hover:bg-white/[0.05]"
            style={{
              borderLeft: `3px solid ${spec.color}`,
            }}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-4 shrink-0 text-right text-xs font-bold tabular-nums text-muted-foreground/50">
                {i + 1}
              </span>

              {spec.iconUrl ? (
                <Image
                  src={spec.iconUrl}
                  alt={spec.specName}
                  width={40}
                  height={40}
                  className="size-10 shrink-0 rounded-lg object-cover"
                  unoptimized
                />
              ) : (
                <div
                  className="size-10 shrink-0 rounded-lg bg-muted/30"
                  style={{
                    border: `1px solid ${spec.color}50`,
                  }}
                />
              )}

              {/* name + pills stacked */}
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-baseline gap-2 overflow-hidden">
                  <span className="shrink-0 text-sm font-bold">{titleizeSlug(spec.specName)}</span>
                  <span
                    className="truncate text-sm font-normal"
                    style={{
                      color: spec.color,
                    }}
                  >
                    {titleizeSlug(spec.className)}
                  </span>
                </div>

                {spec.brackets.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {spec.brackets
                      .filter((b) => b.slug !== "blitz")
                      .map((b) => (
                        <span
                          key={b.slug}
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${TIER_COLORS[b.tier as keyof typeof TIER_COLORS] ?? ""}`}
                        >
                          {SHORT_BRACKET_LABELS[b.slug] ?? b.label}
                          <span className="opacity-60">·</span>
                          {b.tier}
                        </span>
                      ))}
                  </div>
                )}
              </div>

              <p className="shrink-0 self-center text-sm font-bold tabular-nums">
                {(spec.wrHat * 100).toFixed(1)}%
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
