"use client"

import { useHoverSlug } from "@/components/wow/hover-provider"
import { getWowClassBySlug } from "@/lib/wow/classes"
import type { MetaItem, MetaEnchant, MetaGem } from "@/lib/api"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"

const SLOT_LABELS: Record<string, string> = {
  HEAD: "Head", NECK: "Neck", SHOULDER: "Shoulder", BACK: "Back",
  CHEST: "Chest", WRIST: "Wrist", HANDS: "Hands", WAIST: "Waist",
  LEGS: "Legs", FEET: "Feet", FINGER_1: "Ring 1", FINGER_2: "Ring 2",
  TRINKET_1: "Trinket 1", TRINKET_2: "Trinket 2",
  MAIN_HAND: "Main Hand", OFF_HAND: "Off Hand",
}

const QUALITY_COLORS: Record<string, string> = {
  EPIC: "#a335ee",
  RARE: "#0070dd",
  UNCOMMON: "#1eff00",
  COMMON: "#ffffff",
  POOR: "#9d9d9d",
}

function formatSlot(slot: string): string {
  return SLOT_LABELS[slot.toUpperCase()] ?? slot.split("_").map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(" ")
}

function formatSocketType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()
}

const STAT_META: Record<string, { label: string; color: string }> = {
  HASTE_RATING:                  { label: "Haste",       color: "#fef08a" },
  CRIT_RATING:                   { label: "Crit",        color: "#ff6040" },
  MASTERY_RATING:                { label: "Mastery",     color: "#c4b5fd" },
  VERSATILITY:                   { label: "Versatility", color: "#38bdf8" },
}

function statMeta(stat: string): { label: string; color?: string } {
  return STAT_META[stat] ?? {
    label: stat.split("_").map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(" "),
  }
}

function isReshiiWraps(name: string | null | undefined): boolean {
  return !!name?.toLowerCase().includes("reshii wraps")
}

type ItemGroup = { slot: string; entries: MetaItem[] }
type EnchantGroup = { slot: string; entries: MetaEnchant[] }
type GemGroup = { socketType: string; entries: MetaGem[] }

type Props = {
  defaultColor: string
  itemGroups: ItemGroup[]
  enchantGroups: EnchantGroup[]
  gemGroups: GemGroup[]
  fiberGems: MetaGem[]
}

export function BracketBars({ defaultColor, itemGroups, enchantGroups, gemGroups, fiberGems }: Props) {
  const { slug: hoverSlug } = useHoverSlug()
  const activeColor = hoverSlug ? (getWowClassBySlug(hoverSlug)?.color ?? defaultColor) : defaultColor

  return (
    <TooltipProvider>
    <div className="space-y-8" style={{ "--bar-color": activeColor } as React.CSSProperties}>
      {/* Items */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Top Items by Slot</h2>
        {itemGroups.length === 0 && <p className="text-sm text-muted-foreground">No item data available for this bracket.</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          {itemGroups.map(({ slot, entries }) => (
            <div key={slot} className="rounded-lg border bg-card p-4 space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {formatSlot(slot)}
              </h3>
              {entries.slice(0, 5).map((entry) => (
                <div key={entry.id} className="space-y-1">
                  <div className="flex items-center gap-2">
                    {entry.item.icon_url && (
                      <img src={entry.item.icon_url} alt={entry.item.name} width={20} height={20} className="rounded shrink-0" />
                    )}
                    <span className="text-xs font-medium truncate flex-1" style={{ color: QUALITY_COLORS[entry.item.quality] ?? "#ffffff" }}>
                      {entry.item.name}
                    </span>
                    {entry.crafted && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 cursor-default transition-colors duration-700"
                            style={{ color: activeColor, backgroundColor: `${activeColor}22`, borderWidth: 1, borderStyle: "solid", borderColor: `${activeColor}66` }}
                          >
                            CRAFTED
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-card text-card-foreground border border-border shadow-lg" arrowClassName="fill-card bg-card">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-muted-foreground">Top stats:</span>
                            {entry.top_crafting_stats.map((stat) => {
                              const { label, color } = statMeta(stat)
                              return (
                                <span key={stat} className="text-xs font-semibold" style={{ color: color ?? "inherit" }}>
                                  {label}
                                </span>
                              )
                            })}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    {fiberGems.length > 0 && isReshiiWraps(entry.item.name) && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 cursor-default transition-colors duration-700"
                            style={{ color: activeColor, backgroundColor: `${activeColor}22`, borderWidth: 1, borderStyle: "solid", borderColor: `${activeColor}66` }}
                          >
                            {fiberGems[0].item.name}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-card text-card-foreground border border-border shadow-lg" arrowClassName="fill-card bg-card">
                          <div className="space-y-1 min-w-[140px]">
                            <p className="text-xs text-muted-foreground font-medium mb-1">Fiber socket</p>
                            {fiberGems.map((gem) => (
                              <div key={gem.id} className="flex items-center justify-between gap-3">
                                <span className="text-xs">{gem.item.name}</span>
                                <span className="text-xs text-muted-foreground font-mono">{gem.usage_pct.toFixed(1)}%</span>
                              </div>
                            ))}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    <span className="text-xs text-muted-foreground shrink-0 font-mono">{entry.usage_pct.toFixed(1)}%</span>
                  </div>
                  <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full transition-colors duration-700" style={{ width: `${entry.usage_pct}%`, backgroundColor: activeColor }} />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Enchants */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Top Enchants by Slot</h2>
        {enchantGroups.length === 0 && <p className="text-sm text-muted-foreground">No enchant data available for this bracket.</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          {enchantGroups.map(({ slot, entries }) => (
            <div key={slot} className="rounded-lg border bg-card p-4 space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {formatSlot(slot)}
              </h3>
              {entries.slice(0, 3).map((entry) => (
                <div key={entry.id} className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium truncate flex-1">{entry.enchantment.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0 font-mono">{entry.usage_pct.toFixed(1)}%</span>
                  </div>
                  <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full transition-colors duration-700" style={{ width: `${entry.usage_pct}%`, backgroundColor: activeColor }} />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Gems */}
      {gemGroups.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Top Gems by Socket</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {gemGroups.map(({ socketType, entries }) => (
              <div key={socketType} className="rounded-lg border bg-card p-4 space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  {formatSocketType(socketType)} Socket
                </h3>
                {entries.slice(0, 3).map((entry) => (
                  <div key={entry.id} className="space-y-1">
                    <div className="flex items-center gap-2">
                      {entry.item.icon_url && (
                        <img src={entry.item.icon_url} alt={entry.item.name} width={20} height={20} className="rounded shrink-0" />
                      )}
                      <span className="text-xs font-medium truncate flex-1" style={{ color: QUALITY_COLORS[entry.item.quality] ?? "#ffffff" }}>
                        {entry.item.name}
                      </span>
                      <span className="text-xs text-muted-foreground shrink-0 font-mono">{entry.usage_pct.toFixed(1)}%</span>
                    </div>
                    <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full transition-colors duration-700" style={{ width: `${entry.usage_pct}%`, backgroundColor: activeColor }} />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
    </TooltipProvider>
  )
}
