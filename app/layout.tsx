import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { MobileNav } from "@/components/mobile-nav"
import { Header } from "@/components/header"
import { QuickActions } from "@/components/quick-actions"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Farm Manager by Kamili",
  description: "Track and manage farms efficiently with Kamili's farm management solution",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 pb-16 md:pb-0">{children}</main>
            <div className="fixed bottom-0 left-0 z-50 w-full md:hidden">
              <MobileNav />
            </div>
            <QuickActions />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
