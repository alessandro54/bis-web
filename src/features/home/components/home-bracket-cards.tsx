"use client"

import Image from "next/image"
import Link from "next/link"
import { useHoverSlug } from "@/components/providers/hover-provider"
import { bracketColor } from "@/config/wow/brackets-config"
import { titleizeSlug } from "@/lib/utils"

interface TopSpec {
  specName: string
  className: string
  iconUrl?: string
  color: string
  wrHat?: number
}

export interface BracketSummary {
  bracket: string
  label: string
  totalEntries: number
  href: string
  topSpecs: TopSpec[]
}

interface Props {
  brackets: BracketSummary[]
}

export function HomeBracketCards({ brackets }: Props) {
  const hoverSlug = useHoverSlug()
  const glowColor = hoverSlug ? `var(--color-class-${hoverSlug})` : "rgb(249, 115, 22)"

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          PvP Brackets
        </p>
        <div className="ml-2 h-px flex-1 bg-gradient-to-r from-border to-transparent" />
      </div>
      <div className="cv-auto grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {brackets.map((b) => {
          const accentColor = bracketColor(b.bracket) ?? glowColor
          const topWr = b.topSpecs[0]?.wrHat

          return (
            <Link
              key={b.bracket}
              href={b.href}
              prefetch={false}
              className="group relative flex flex-col gap-1.5 overflow-hidden rounded-xl border px-5 py-3.5 transition-all"
              style={{
                borderColor: `color-mix(in oklch, ${accentColor} 20%, transparent)`,
                background: `color-mix(in oklch, ${accentColor} 5%, transparent)`,
              }}
            >
              {/* Top accent line */}
              <div
                className="absolute inset-x-0 top-0 h-[2px] opacity-60 transition-opacity group-hover:opacity-100"
                style={{
                  background: accentColor,
                }}
              />

              {/* Name + description */}
              <p className="text-lg font-bold">{b.label}</p>
              <p className="mb-3 text-[10px] uppercase tracking-wider text-muted-foreground">
                {b.bracket === "2v2"
                  ? "Two vs Two Arena"
                  : b.bracket === "3v3"
                    ? "Three vs Three Arena"
                    : b.bracket === "shuffle"
                      ? "6-Player Round-Robin"
                      : "10-Player Battleground"}
              </p>

              {/* Top win rate bar */}
              {topWr !== undefined && (
                <div className="mb-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Top Win Rate
                    </span>
                    <span className="text-xs font-bold text-emerald-400">
                      {(topWr * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-1 h-[2px] rounded-full bg-black/[0.06] dark:bg-white/[0.05]">
                    <div
                      className="h-full rounded-full opacity-65"
                      style={{
                        width: `${topWr * 100}%`,
                        background: accentColor,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Top 3 spec chips */}
              <div className="flex flex-wrap gap-1.5 border-t border-black/[0.06] pt-3 dark:border-white/[0.04]">
                {b.topSpecs.slice(0, 3).map((spec) => (
                  <div
                    key={spec.specName}
                    className="flex items-center gap-1.5 rounded border border-black/[0.08] bg-black/[0.04] px-1.5 py-1 dark:border-white/[0.06] dark:bg-white/[0.03]"
                  >
                    {spec.iconUrl ? (
                      <Image
                        src={spec.iconUrl}
                        alt={spec.specName}
                        width={16}
                        height={16}
                        className="rounded"
                        loading="lazy"
                        decoding="async"
                        fetchPriority="low"
                        unoptimized
                      />
                    ) : (
                      <div
                        className="size-4 rounded"
                        style={{
                          background: spec.color,
                          opacity: 0.5,
                        }}
                      />
                    )}
                    <span
                      className="text-[10px] font-medium"
                      style={{
                        color: spec.color,
                      }}
                    >
                      {titleizeSlug(spec.specName)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">
                  <strong className="font-medium text-muted-foreground/80">
                    {b.totalEntries.toLocaleString()}
                  </strong>{" "}
                  players
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
