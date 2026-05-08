import { render, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/fx/home-bg-webgl", () => ({
  createHomeBgRenderer: vi.fn(() => ({
    dispose: vi.fn(),
    setColor: vi.fn(),
  })),
}))

const { BgCanvasInner } = await import("../home-bg-canvas")

describe("BgCanvasInner", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Stub requestIdleCallback to fire synchronously so the deferred GL upgrade
    // happens within the test tick.
    Object.defineProperty(window, "requestIdleCallback", {
      configurable: true,
      writable: true,
      value: (cb: () => void) => {
        cb()
        return 0
      },
    })
  })

  it("upgrades from CSS fallback to canvas after idle", async () => {
    const { container } = render(<BgCanvasInner />)
    await waitFor(() => {
      expect(container.querySelector("canvas")).toBeInTheDocument()
    })
  })
})
