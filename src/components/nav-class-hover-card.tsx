"use client"

import Image from "next/image"
import Link from "next/link"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { SidebarMenuButton } from "@/components/ui/sidebar"
import type { NavMainItem } from "@/config/wow/nav"

const QUICK_BRACKETS = [
  { slug: "2v2",     label: "2v2" },
  { slug: "3v3",     label: "3v3" },
  { slug: "shuffle", label: "SS"  },
] as const

type Props = {
  item: NavMainItem
  onMouseEnter: () => void
}

export function NavClassHoverCard({ item, onMouseEnter }: Props) {
  const classColor = `var(--color-class-${item.slug})`

  return (
    <HoverCard openDelay={150} closeDelay={100}>
      <HoverCardTrigger asChild>
        <SidebarMenuButton onMouseEnter={onMouseEnter}>
          <Image src={item.iconUrl} width={20} height={20} className="rounded-full" alt={item.title} />
          <span>{item.title}</span>
        </SidebarMenuButton>
      </HoverCardTrigger>

      <HoverCardContent
        side="bottom"
        align="start"
        sideOffset={4}
        className="w-52 p-2"
      >
        <p className="text-xs font-bold uppercase tracking-wider px-1 pb-2" style={{ color: classColor }}>
          {item.title}
        </p>

        <div className="space-y-0.5">
          {item.items.map((spec) => (
            <div key={spec.title} className="group/spec">
              <Link
                href={`/${item.slug}/${spec.title}`}
                className="flex items-center gap-2 px-1 py-1 rounded hover:bg-muted transition-colors"
              >
                <Image src={spec.iconUrl} width={16} height={16} className="rounded-full shrink-0" alt={spec.title} />
                <span className="text-sm capitalize">{spec.title}</span>
              </Link>
              <div className="grid grid-rows-[0fr] group-hover/spec:grid-rows-[1fr] transition-[grid-template-rows] duration-200 ease-out">
                <div className="overflow-hidden">
                  <div className="flex justify-center gap-1 px-1 pb-1 pt-0.5 opacity-0 group-hover/spec:opacity-100 transition-opacity duration-150 delay-75">
                    {QUICK_BRACKETS.map(({ slug, label }) => (
                      <Link
                        key={slug}
                        href={`/${item.slug}/${spec.title}/pvp/${slug}`}
                        className="class-pill text-[10px] font-semibold px-1.5 py-0.5 rounded"
                        style={{ "--pill-color": classColor } as React.CSSProperties}
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
