import path, { dirname } from "node:path"
// This file has been automatically migrated to valid ESM format by Storybook.
import { fileURLToPath } from "node:url"
import type { StorybookConfig } from "@storybook/react-vite"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const config: StorybookConfig = {
  stories: [
    "../src/components/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-themes",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  staticDirs: [
    "../public",
  ],
  viteFinal: async (config) => {
    config.resolve ??= {}
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "next/navigation": path.resolve(__dirname, "./mocks/next-navigation.ts"),
      "next/image": path.resolve(__dirname, "./mocks/next-image.tsx"),
      "next/link": path.resolve(__dirname, "./mocks/next-link.tsx"),
      "@/lib/fx/home-bg-webgl": path.resolve(__dirname, "./mocks/home-bg-webgl.ts"),
      "@": path.resolve(__dirname, "../src"),
    }
    return config
  },
}

export default config
