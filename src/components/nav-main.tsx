"use client"

import { useState, useRef } from "react"
import { ChevronRight } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"

import Image from "next/image"
import Link from "next/link"
import { navMain } from "@/config/wow/nav"
import { useHoverSlug } from "./wow/hover-provider"
import { NavClassHoverCard } from "@/components/nav-class-hover-card"
import type { WowClassSlug } from "@/config/wow/classes"

export function NavMain() {
  const { setSlug } = useHoverSlug()
  const [openSlug, setOpenSlug] = useState<WowClassSlug | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { open: sidebarOpen } = useSidebar()

  function handleItemEnter(item: typeof navMain[number]) {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setOpenSlug(item.slug)
      setSlug(item.slug)
      item.items.forEach((spec) => {
        fetch(`/api/prefetch/items?spec_id=${spec.id}&bracket=3v3`, { priority: "low" }).catch(() => {})
      })
    }, 80)
  }

  function handleMenuLeave() {
    if (timerRef.current) clearTimeout(timerRef.current)
    setOpenSlug(null)
    setSlug(null)
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Guides</SidebarGroupLabel>
      <SidebarMenu onMouseLeave={handleMenuLeave}>
        {navMain.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            open={openSlug === item.slug}
            className="group/collapsible"
            onMouseEnter={() => handleItemEnter(item)}
          >
            <SidebarMenuItem>
              {sidebarOpen ? (
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    <Image src={item.iconUrl} width={20} height={20} className="rounded-full" alt={item.title} />
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
              ) : (
                <NavClassHoverCard
                  item={item}
                  onMouseEnter={() => setSlug(item.slug)}
                />
              )}
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => {
                    const classColor = `var(--color-class-${item.slug})`
                    const pillStyle = { "--pill-color": classColor } as React.CSSProperties
                    return (
                      <SidebarMenuSubItem key={subItem.title} className="group/spec">
                        <SidebarMenuSubButton asChild>
                          <Link href={subItem.url}>
                            <Image src={subItem.iconUrl} width={16} height={16} className="rounded-full shrink-0" alt={subItem.title} />
                            <span className="capitalize">{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                        <div className="grid grid-rows-[0fr] group-hover/spec:grid-rows-[1fr] transition-[grid-template-rows] duration-200 ease-out">
                          <div className="overflow-hidden">
                            <div className="flex justify-center gap-1 px-2 pb-1.5 pt-0.5 opacity-0 group-hover/spec:opacity-100 transition-opacity duration-150 delay-75">
                              {(["2v2", "3v3", "shuffle"] as const).map((bracket) => (
                                <Link
                                  key={bracket}
                                  href={`/${item.slug}/${subItem.title}/pvp/${bracket}`}
                                  className="class-pill text-[10px] font-semibold px-1.5 py-0.5 rounded"
                                  style={pillStyle}
                                >
                                  {bracket === "shuffle" ? "SS" : bracket}
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      </SidebarMenuSubItem>
                    )
                  })}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
