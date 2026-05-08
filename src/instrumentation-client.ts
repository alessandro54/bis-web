// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: "https://9cbfca00559f1df4b6e6114999baa86c@o4511145203073024.ingest.us.sentry.io/4511266295513088",

  enabled: process.env.NODE_ENV === "production",
  environment: process.env.NODE_ENV,

  // No eager replay integration — load it lazily after first paint so the
  // ~50KB chunk doesn't ship in the critical path.
  integrations: [],

  // 10% of traces in prod is plenty for diagnostics; 100% inflated bundle
  // and Sentry quota.
  tracesSampleRate: 0.1,
  enableLogs: true,

  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  sendDefaultPii: true,
})

// Lazy-load the Replay integration after the page is interactive.
// This keeps Replay code out of the initial JS bundle.
if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
  const loadReplay = async () => {
    try {
      const replay = await Sentry.lazyLoadIntegration("replayIntegration")
      Sentry.getClient()?.addIntegration(replay())
    } catch {
      // ignore — replay is best-effort
    }
  }
  const ric = (
    window as Window & {
      requestIdleCallback?: (
        cb: () => void,
        opts?: {
          timeout: number
        },
      ) => number
    }
  ).requestIdleCallback
  if (ric)
    ric(loadReplay, {
      timeout: 4000,
    })
  else window.setTimeout(loadReplay, 2000)
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
