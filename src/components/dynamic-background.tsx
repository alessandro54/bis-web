"use client";

import { usePathname } from "next/navigation";
import type { WowClassSlug } from "@/config/wow/classes";
import { useHoverSlug } from "./wow/hover-provider";

export default function DynamicBackground() {
  const { slug: hoverSlug } = useHoverSlug();
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);
  const baseSlug = (segments[0] as WowClassSlug | undefined) ?? null;
  const activeSlug = hoverSlug ?? baseSlug;
  const background = activeSlug ? `var(--color-class-${activeSlug})` : "oklch(0.7 0.15 340)";

  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 w-[90vw] h-[50vw] rounded-full filter blur-3xl opacity-30 animate-blob animation-delay-6000 pointer-events-none overflow-hidden transition-all duration-700 ease-in-out"
      style={{
        zIndex: -1,
        bottom: "-45vw",
        background
      }}
    />
  );
}
