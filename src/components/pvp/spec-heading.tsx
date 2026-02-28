import type { WowClassSlug } from "@/config/wow/classes"

type Props = {
  className: string
  classSlug: WowClassSlug
  specSlug: string
  bracket: string
}

export function SpecHeading({ className, classSlug, specSlug, bracket }: Props) {
  return (
    <div>
      <h1 className="text-2xl font-bold capitalize" style={{ color: `var(--color-class-${classSlug})` }}>
        {className} — {specSlug}
      </h1>
      <p className="text-sm text-muted-foreground capitalize">{bracket} · PvP</p>
    </div>
  )
}
