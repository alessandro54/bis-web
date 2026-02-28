import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { ThemeSwitcher } from "@/components/theme-switcher"

type Props = {
  children?: React.ReactNode
  centerSlot?: React.ReactNode
}

export function PageHeader({ children, centerSlot }: Props) {
  return (
    <header className="bg-background sticky top-0 z-20 flex shrink-0 items-center gap-2 border-b p-4 h-[60px]">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
      <div className="hidden sm:flex flex-1 min-w-0 items-center">
        {children}
      </div>
      {centerSlot && (
        <div className="flex flex-1 justify-center">{centerSlot}</div>
      )}
      {!centerSlot && <div className="flex-1" />}
      <ThemeSwitcher />
    </header>
  )
}
