"use client"

import { useState } from "react"
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
} from "@/components/ui/sidebar"

import Image from "next/image"
import Link from "next/link"
import { navMain } from "@/config/wow/nav"
import { useHoverSlug } from "./wow/hover-provider"
import type { WowClassSlug } from "@/config/wow/classes"

export function NavMain() {
  const { setSlug } = useHoverSlug()
  const [openSlug, setOpenSlug] = useState<WowClassSlug | null>(null)

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Guides</SidebarGroupLabel>
      <SidebarMenu>
        {navMain.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            open={openSlug === item.slug}
            className="group/collapsible"
            onMouseEnter={() => {
              setOpenSlug(item.slug)
              setSlug(item.slug)
              item.items.forEach((spec) => {
                fetch(`/api/prefetch/items?spec_id=${spec.id}&bracket=3v3`, { priority: "low" }).catch(() => {})
              })
            }}
            onMouseLeave={() => setSlug(null)}
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title}>
                  <Image src={item.iconUrl} width={20} height={20} className="rounded-full" alt={item.title} />
                  <span>{item.title}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton asChild>
                        <Link href={subItem.url}>
                          <Image src={subItem.iconUrl} width={16} height={16} className="rounded-full shrink-0" alt={subItem.title} />
                          <span className="capitalize">{subItem.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
