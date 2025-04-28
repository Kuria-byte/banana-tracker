"use client"

import type * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

interface ThemeProviderProps extends React.PropsWithChildren {
  attribute?: string
  defaultTheme?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

export function ThemeProvider({
  attribute = "class",
  defaultTheme = "system",
  enableSystem = true,
  disableTransitionOnChange = false,
  children,
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute={attribute}
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
      disableTransitionOnChange={disableTransitionOnChange}
    >
      {children}
    </NextThemesProvider>
  )
}

export function useTheme() {
  return {
    setTheme: (theme: string) => {
      if (typeof window !== "undefined") {
        window.document.documentElement.setAttribute("data-theme", theme)
      }
    },
    theme: typeof window !== "undefined" ? window.document.documentElement.getAttribute("data-theme") : "system",
  }
}
