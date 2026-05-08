import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { cookies } from "next/headers"
import { AppFooter } from "@/components/molecules/app-footer"
import { TopNav } from "@/components/molecules/top-nav"
import { AppSidebar } from "@/components/organisms/app-sidebar"
import DynamicBackground from "@/components/organisms/dynamic-background"
import { HoverProvider } from "@/components/providers/hover-provider"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { TopNavProvider } from "@/components/providers/top-nav-provider"
import { PageTransition } from "@/components/atoms/page-transition"
import { ScrollToTop } from "@/components/atoms/scroll-to-top"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import "./globals.css"

const inter = Inter({
  subsets: [
    "latin",
  ],
  variable: "--font-inter",
})
const jetbrainsMono = JetBrains_Mono({
  subsets: [
    "latin",
  ],
  variable: "--font-jetbrains-mono",
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:5123"
const SITE_NAME = "WoW Stats"
const DEFAULT_DESCRIPTION =
  "Live WoW PvP & PvE meta stats powered by real Blizzard ladder data. " +
  "Spec rankings, BiS gear, enchants, gems, and talents for Arena, Solo Shuffle, Blitz, and M+. " +
  "Updated every 6 hours. — Estadísticas en vivo de WoW PvP y PvE."

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Live WoW PvP & PvE Meta`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    "wow tier",
    "wow meta",
    "WoW PvP meta",
    "WoW arena stats",
    "solo shuffle meta",
    "WoW best in slot",
    "WoW spec rankings",
    "World of Warcraft PvP tier list",
    "WoW ladder data",
    "wow pvp meta midnight",
    "arena tier list",
    "wow stats",
    "wowstats",
  ],
  authors: [
    {
      name: SITE_NAME,
      url: SITE_URL,
    },
  ],
  creator: SITE_NAME,
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
    alternateLocale: [
      "es_MX",
    ],
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    site: "@wowstatsgg",
    creator: "@wowstatsgg",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const widthCookie = cookieStore.get("sidebar_width")
  const stateCookie = cookieStore.get("sidebar_state")
  const defaultWidth = widthCookie ? Number(widthCookie.value) : undefined
  const defaultOpen = stateCookie ? stateCookie.value === "true" : false

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <link rel="dns-prefetch" href="https://cdn.wowstats.gg" />
        <link rel="dns-prefetch" href="https://render.worldofwarcraft.com" />
        <link rel="preconnect" href="https://cdn.wowstats.gg" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://render.worldofwarcraft.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: SITE_NAME,
              url: SITE_URL,
              description: "Live WoW PvP & PvE meta stats powered by real Blizzard ladder data.",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${SITE_URL}/character/{region}/{realm}/{name}`,
                },
                "query-input": "required name=name",
              },
            }),
          }}
        />
      </head>
      <body className="bg-background text-foreground h-dvh overflow-hidden antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <HoverProvider>
            <SidebarProvider defaultOpen={defaultOpen} defaultWidth={defaultWidth}>
              <DynamicBackground />
              <AppSidebar />
              <SidebarInset
                className="h-dvh overflow-y-auto overflow-x-hidden"
                data-scroll-container=""
              >
                <ScrollToTop />
                <PageTransition />
                <TopNavProvider>
                  <TopNav />
                  <div className="flex-1 w-full pb-45">{children}</div>
                  <AppFooter />
                </TopNavProvider>
              </SidebarInset>
            </SidebarProvider>
          </HoverProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
