import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { WOW_CLASSES } from "@/config/wow/classes"
import { BracketSelector } from "@/components/pvp/bracket-selector"
import { PageHeader } from "@/components/page-header"
import { SpecHeading } from "@/components/pvp/spec-heading"
import { BracketBars } from "@/components/pvp/bracket-bars"
import { fetchItems, fetchEnchants, fetchGems, type MetaItem, type MetaEnchant, type MetaGem } from "@/lib/api"
import { notFound } from "next/navigation"
import Image from "next/image"
import type { Metadata } from "next"

const SLOT_ORDER = [
  "HEAD", "NECK", "SHOULDER", "BACK", "CHEST", "WRIST", "HANDS", "WAIST", "LEGS", "FEET",
  "FINGER_1", "FINGER_2", "TRINKET_1", "TRINKET_2", "MAIN_HAND", "OFF_HAND",
]

function groupBy<T>(items: T[], key: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>()
  for (const item of items) {
    const k = key(item)
    const arr = map.get(k) ?? []
    arr.push(item)
    map.set(k, arr)
  }
  return map
}

function sortedBySlotOrder<T>(map: Map<string, T[]>): { slot: string; entries: T[] }[] {
  const result: { slot: string; entries: T[] }[] = []
  for (const slot of SLOT_ORDER) {
    const entry = map.get(slot) ?? map.get(slot.toLowerCase())
    if (entry) result.push({ slot, entries: entry })
  }
  for (const [slot, entries] of map) {
    if (!result.some((r) => r.slot.toUpperCase() === slot.toUpperCase())) {
      result.push({ slot, entries })
    }
  }
  return result
}

type PageProps = {
  params: Promise<{ classSlug: string; specSlug: string; bracket: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { classSlug, specSlug, bracket } = await params
  return { title: `${specSlug} ${classSlug} PvP – ${bracket} | WoW Meta` }
}

export const dynamic = "force-dynamic"

const API_CLASS_SLUG: Record<string, string> = {
  "death-knight": "deathknight",
  "demon-hunter": "demonhunter",
}

function apiBracket(bracket: string, classSlug: string, specSlug: string): string {
  if (bracket === "shuffle") {
    const apiClass = API_CLASS_SLUG[classSlug] ?? classSlug
    return `shuffle-${apiClass}-${specSlug}`
  }
  return bracket
}

export default async function SpecPage({ params }: PageProps) {
  const { classSlug, specSlug, bracket } = await params

  const cls = WOW_CLASSES.find((c) => c.slug === classSlug)
  const spec = cls?.specs.find((s) => s.name === specSlug)
  if (!cls || !spec) notFound()

  const resolvedBracket = apiBracket(bracket, classSlug, specSlug)

  const [items, enchants, gems] = await Promise.all([
    fetchItems(resolvedBracket, spec.id).catch((): MetaItem[] => []),
    fetchEnchants(resolvedBracket, spec.id).catch((): MetaEnchant[] => []),
    fetchGems(resolvedBracket, spec.id).catch((): MetaGem[] => []),
  ])

  const itemGroups = sortedBySlotOrder(groupBy(items, (i) => i.slot.toUpperCase()))
  const enchantGroups = sortedBySlotOrder(groupBy(enchants, (e) => e.slot.toUpperCase()))
  const fiberGems = gems.filter((g) => g.socket_type === "FIBER")
  const gemGroups = Array.from(groupBy(gems.filter((g) => g.socket_type !== "FIBER"), (g) => g.socket_type)).map(([socketType, entries]) => ({ socketType, entries }))

  return (
    <>
      <PageHeader
        centerSlot={<BracketSelector classSlug={cls.slug} specSlug={specSlug} currentBracket={bracket} />}
      >
        <Breadcrumb className="flex-1 min-w-0">
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href={`/${classSlug}`}>{cls.name}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage className="capitalize">{specSlug}</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>PvP</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </PageHeader>

      <div className="animate-page-in mx-auto max-w-5xl space-y-8 overflow-auto" style={{ height: "calc(100vh - 60px)" }}>
        <div className="flex items-center gap-3 sticky top-0 z-10 bg-background px-6 py-3">
          <Image src={spec.iconUrl} alt={specSlug} width={40} height={40} className="rounded-full" />
          <SpecHeading className={cls.name} classSlug={cls.slug} specSlug={specSlug} bracket={bracket} />
        </div>
        <div className="px-6">
        <BracketBars
          classSlug={cls.slug}
          itemGroups={itemGroups}
          enchantGroups={enchantGroups}
          gemGroups={gemGroups}
          fiberGems={fiberGems}
        />
        </div>
      </div>
    </>
  )
}
