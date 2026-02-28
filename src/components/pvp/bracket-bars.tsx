"use client"

import { useActiveColor } from "@/hooks/use-active-color"
import type { WowClassSlug } from "@/config/wow/classes"
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
  POOR: "#9d9d9d",
}

function formatSlot(slot: string): string {
  return SLOT_LABELS[slot.toUpperCase()] ?? slot.split("_").map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(" ")
}

function formatSocketType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()
}

const STAT_LABELS: Record<string, string> = {
  HASTE_RATING:                  "Haste",
  CRITICAL_STRIKE_RATING:        "Crit",
  CRIT_RATING:                   "Crit",
  MASTERY_RATING:                "Mastery",
  VERSATILITY_DAMAGE_DONE:       "Versatility",
  VERSATILITY_DAMAGE_DONE_PCT:   "Versatility",
  VERSATILITY:                   "Versatility",
}

const STAT_COLOR_VARS: Record<string, string> = {
  HASTE_RATING:                "var(--color-stat-haste)",
  CRITICAL_STRIKE_RATING:      "var(--color-stat-crit)",
  CRIT_RATING:                 "var(--color-stat-crit)",
  MASTERY_RATING:              "var(--color-stat-mastery)",
  VERSATILITY_DAMAGE_DONE:     "var(--color-stat-versatility)",
  VERSATILITY_DAMAGE_DONE_PCT: "var(--color-stat-versatility)",
  VERSATILITY:                 "var(--color-stat-versatility)",
}

function getStatMeta(stat: string): { label: string; color?: string } {
  const label = STAT_LABELS[stat] ?? stat.split("_").map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(" ")
  return { label, color: STAT_COLOR_VARS[stat] }
}

function isReshiiWraps(name: string | null | undefined): boolean {
  return !!name?.toLowerCase().includes("reshii wraps")
}

type ItemGroup = { slot: string; entries: MetaItem[] }
type EnchantGroup = { slot: string; entries: MetaEnchant[] }
type GemGroup = { socketType: string; entries: MetaGem[] }

type Props = {
  classSlug: WowClassSlug
  itemGroups: ItemGroup[]
  enchantGroups: EnchantGroup[]
  gemGroups: GemGroup[]
  fiberGems: MetaGem[]
}

export function BracketBars({ classSlug, itemGroups, enchantGroups, gemGroups, fiberGems }: Props) {
  const activeColor = useActiveColor(classSlug)

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
                    <span className="text-xs font-medium truncate flex-1" style={{ color: QUALITY_COLORS[entry.item.quality] }}>
                      {entry.item.name}
                    </span>
                    {entry.crafted && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                            className="class-pill text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 cursor-default"
                            style={{ "--pill-color": activeColor } as React.CSSProperties}
                          >
                            CRAFTED
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-card text-card-foreground border border-border shadow-lg" arrowClassName="fill-card bg-card">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-muted-foreground">Top stats:</span>
                            {entry.top_crafting_stats.map((stat) => {
                              const { label, color } = getStatMeta(stat)
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
                            className="class-pill text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 cursor-default"
                            style={{ "--pill-color": activeColor } as React.CSSProperties}
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
                      <span className="text-xs font-medium truncate flex-1" style={{ color: QUALITY_COLORS[entry.item.quality] }}>
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
