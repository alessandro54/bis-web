import { Suspense } from "react"
import dynamic from "next/dynamic"
import { LazySection } from "@/components/atoms/lazy-section"
import { ScrollHint } from "@/features/home/components/scroll-hint"
import type { BracketSummary } from "@/features/home/components/home-bracket-cards"

const HomeBgCanvas = dynamic(
  () => import("@/features/home/components/home-bg-canvas").then((m) => m.HomeBgCanvas),
  {
    loading: () => null,
  },
)
import { HomeBracketCards } from "@/features/home/components/home-bracket-cards"
import { HomeClassGrid } from "@/features/home/components/home-class-grid"
import { HomeHero } from "@/features/home/components/home-hero"
import type { TopSpecBracket, TopSpecEntry } from "@/features/home/components/home-top-specs-list"
import { HomeTopSpecsList } from "@/features/home/components/home-top-specs-list"
import { tier, tierByPercentile } from "@/config/app-config"
import type { WowClassSlug } from "@/config/wow/classes/classes-config"
import { WOW_CLASSES } from "@/config/wow/classes/classes-config"
import { fetchClassDistribution } from "@/lib/api"

export const revalidate = 21600

const BRACKETS = [
  {
    bracket: "2v2",
    label: "2v2",
  },
  {
    bracket: "3v3",
    label: "3v3",
  },
  {
    bracket: "shuffle",
    label: "Solo Shuffle",
  },
  {
    bracket: "blitz",
    label: "Blitz",
  },
]

const SOLO_BRACKETS = [
  "shuffle",
  "blitz",
]

const classMap = new Map(
  WOW_CLASSES.map((c) => [
    c.slug,
    c,
  ]),
)

function normalizeClassSlug(value: string): string {
  return value.trim().toLowerCase().replace(/_/g, "-")
}

function normalizeSpecName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[-_\s]/g, "")
}

function findSpecIcon(classSlug: string, specSlug: string): string | undefined {
  const cls = classMap.get(classSlug as WowClassSlug)
  return cls?.specs.find((s) => normalizeSpecName(s.name) === normalizeSpecName(specSlug))?.iconUrl
}

async function HomeContent() {
  const results = await Promise.all(
    BRACKETS.map(({ bracket }) =>
      fetchClassDistribution({
        bracket,
        region: "all",
        role: "all",
      }).catch(() => null),
    ),
  )

  let seasonId = 41
  let totalEntries = 0
  const bracketSummaries: BracketSummary[] = []
  let topHeroSpecs: {
    specName: string
    className: string
    bracket: string
    wrHat: number
    presence: number
    iconUrl?: string
    color: string
    specUrl: string
    tier: string
  }[] = []

  for (let i = 0; i < BRACKETS.length; i++) {
    const { bracket, label } = BRACKETS[i]
    const data = results[i]
    if (!data) {
      bracketSummaries.push({
        bracket,
        label,
        totalEntries: 0,
        href: `/pvp/meta/${bracket}/dps`,
        topSpecs: [],
      })
      continue
    }

    seasonId = data.season_id
    totalEntries += data.total_entries

    const sorted = [
      ...data.classes,
    ].sort((a, b) => b.score - a.score)
    const dps = sorted.filter((s) => s.role === "dps")
    const maxScore = dps[0]?.score ?? 1
    const isSolo = SOLO_BRACKETS.includes(bracket)

    const topSpecs = dps.slice(0, 3).map((spec) => {
      const classSlug = normalizeClassSlug(spec.class)
      return {
        specName: spec.spec,
        className: spec.class,
        iconUrl: findSpecIcon(classSlug, spec.spec),
        color: `var(--color-class-${classSlug})`,
        wrHat: spec.wr_hat,
      }
    })

    bracketSummaries.push({
      bracket,
      label,
      totalEntries: data.total_entries,
      href: `/pvp/meta/${bracket}/dps`,
      topSpecs,
    })

    if (bracket === "3v3" && topHeroSpecs.length === 0) {
      const presenceTotal = sorted.reduce((s, r) => s + r.count, 0)
      topHeroSpecs = dps.slice(0, 3).map((spec) => {
        const classSlug = normalizeClassSlug(spec.class)
        const normPct = (spec.score / maxScore) * 100
        const t = isSolo ? tierByPercentile(dps.indexOf(spec) + 1, dps.length) : tier(normPct)
        return {
          specName: spec.spec,
          className: spec.class,
          bracket,
          wrHat: spec.wr_hat,
          presence: presenceTotal > 0 ? spec.count / presenceTotal : 0,
          iconUrl: findSpecIcon(classSlug, spec.spec),
          color: `var(--color-class-${classSlug})`,
          specUrl: `/pvp/${classSlug}/${spec.spec.toLowerCase()}/${bracket}`,
          tier: t,
        }
      })
    }
  }

  // Build per-bracket tier lookup: "ClassName-SpecName" -> TopSpecBracket[]
  const specBracketTiers = new Map<string, TopSpecBracket[]>()
  for (let i = 0; i < BRACKETS.length; i++) {
    const data = results[i]
    if (!data) continue
    const { bracket, label } = BRACKETS[i]
    const isSolo = SOLO_BRACKETS.includes(bracket)
    const sorted = [
      ...data.classes,
    ].sort((a, b) => b.score - a.score)
    const dps = sorted.filter((s) => s.role === "dps")
    const maxScore = dps[0]?.score ?? 1
    dps.forEach((spec, idx) => {
      const key = `${spec.class}-${spec.spec}`
      const normPct = (spec.score / maxScore) * 100
      const t = isSolo ? tierByPercentile(idx + 1, dps.length) : tier(normPct)
      const entry: TopSpecBracket = {
        label,
        slug: bracket,
        tier: t,
      }
      const existing = specBracketTiers.get(key)
      if (existing) existing.push(entry)
      else
        specBracketTiers.set(key, [
          entry,
        ])
    })
  }

  // Top DPS specs across all brackets, deduped and ranked by win rate
  const seenSpecs = new Set<string>()
  const topSpecsList: TopSpecEntry[] = results
    .flatMap((data, i) => {
      if (!data) return []
      const bracket = BRACKETS[i].bracket
      const sorted = [
        ...data.classes,
      ].sort((a, b) => b.score - a.score)
      return sorted
        .filter((s) => s.role === "dps")
        .slice(0, 3)
        .map((spec) => {
          const classSlug = normalizeClassSlug(spec.class)
          const key = `${spec.class}-${spec.spec}`
          return {
            specName: spec.spec,
            className: spec.class,
            wrHat: spec.wr_hat,
            iconUrl: findSpecIcon(classSlug, spec.spec),
            color: `var(--color-class-${classSlug})`,
            specUrl: `/pvp/${classSlug}/${spec.spec.toLowerCase()}/${bracket}`,
            brackets: specBracketTiers.get(key) ?? [],
          }
        })
    })
    .sort((a, b) => b.wrHat - a.wrHat)
    .filter((s) => {
      const key = `${s.className}-${s.specName}`
      if (seenSpecs.has(key)) return false
      seenSpecs.add(key)
      return true
    })
    .slice(0, 4)

  return (
    <>
      {/* Step 1 — identity: who we are + top specs */}
      <div className="animate-stream-in relative z-[2] flex min-h-[calc(100dvh-3.75rem)] items-center px-4 py-12 lg:px-6">
        <div className="mx-auto w-full max-w-5xl">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-16">
            <HomeHero seasonId={seasonId} totalEntries={totalEntries} />
            <div className="mx-auto w-full max-w-lg lg:max-w-none">
              <HomeTopSpecsList specs={topSpecsList} />
            </div>
          </div>
        </div>
        <ScrollHint />
      </div>

      {/* Step 2 — discovery: bracket cards + class grid */}
      <LazySection className="animate-stream-in relative z-[2] mx-auto w-full max-w-5xl space-y-10 px-4 pb-16 lg:px-6">
        <HomeBracketCards brackets={bracketSummaries} />
        <HomeClassGrid classes={WOW_CLASSES} />
      </LazySection>
    </>
  )
}

export default function Home() {
  return (
    <div className="animate-page-in relative">
      <HomeBgCanvas />
      <Suspense
        fallback={
          <div className="relative z-[2] flex min-h-[calc(100dvh-3.75rem)] items-center justify-center">
            <ScrollHint />
          </div>
        }
      >
        <HomeContent />
      </Suspense>
    </div>
  )
}
