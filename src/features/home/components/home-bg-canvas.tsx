"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { CssFallbackBg } from "@/components/atoms/css-fallback-bg"

function resolveCssColor(css: string):
  | [
      number,
      number,
      number,
    ]
  | undefined {
  try {
    const el = document.createElement("div")
    el.style.color = css
    el.style.position = "absolute"
    el.style.visibility = "hidden"
    document.body.appendChild(el)
    const computed = getComputedStyle(el).color
    document.body.removeChild(el)
    const m = computed.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    if (!m) return undefined
    return [
      parseInt(m[1]) / 255,
      parseInt(m[2]) / 255,
      parseInt(m[3]) / 255,
    ]
  } catch {
    return undefined
  }
}

type Renderer = {
  dispose: () => void
  setColor: (r: number, g: number, b: number) => void
}

export function BgCanvasInner({ color }: { color?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<Renderer | null>(null)
  const [useFallback, setUseFallback] = useState(false)
  const [glReady, setGlReady] = useState(false)

  // Render WebGL only after first paint, when browser is idle, and only if
  // the user hasn't requested reduced motion. Lighthouse / cold paints get
  // the cheap CSS fallback; everyone else upgrades when convenient.
  useEffect(() => {
    if (typeof window === "undefined") return
    if (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return
    }

    const ric = (
      window as Window & {
        requestIdleCallback?: (
          cb: () => void,
          opts?: {
            timeout: number
          },
        ) => number
        cancelIdleCallback?: (id: number) => void
      }
    ).requestIdleCallback

    const cic = (
      window as Window & {
        cancelIdleCallback?: (id: number) => void
      }
    ).cancelIdleCallback

    const id = ric
      ? ric(() => setGlReady(true), {
          timeout: 2000,
        })
      : window.setTimeout(() => setGlReady(true), 200)

    return () => {
      if (cic) cic(id)
      else window.clearTimeout(id)
    }
  }, [])

  // Mount renderer once GL chunk is requested.
  useEffect(() => {
    if (!glReady) return
    const canvas = canvasRef.current
    if (!canvas) return

    let cancelled = false
    let renderer: Renderer | null = null

    import("@/lib/fx/home-bg-webgl")
      .then(({ createHomeBgRenderer }) => {
        if (cancelled || !canvas) return
        const resolved = color ? resolveCssColor(color) : undefined
        try {
          renderer = createHomeBgRenderer(
            canvas,
            () => setUseFallback(true),
            resolved
              ? {
                  color: resolved,
                }
              : undefined,
          )
          rendererRef.current = renderer
        } catch (e) {
          console.error("[HomeBg]", e)
          setUseFallback(true)
        }
      })
      .catch((e) => {
        console.error("[HomeBg] chunk load failed", e)
        setUseFallback(true)
      })

    return () => {
      cancelled = true
      renderer?.dispose()
      rendererRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    glReady,
  ])

  // Color changes — lerp without recreating.
  useEffect(() => {
    if (!color) return
    const resolved = resolveCssColor(color)
    if (resolved) rendererRef.current?.setColor(...resolved)
  }, [
    color,
  ])

  if (useFallback || !glReady) return <CssFallbackBg />

  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{
        zIndex: -1,
      }}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  )
}

export function HomeBgCanvas({ color }: { color?: string } = {}) {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const inset = document.querySelector("[data-slot='sidebar-inset']")
    const target = inset?.parentElement ?? document.body
    setPortalTarget(target)
  }, [])

  if (!portalTarget) return null
  return createPortal(<BgCanvasInner color={color} />, portalTarget)
}
