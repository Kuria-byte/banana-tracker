import type React from "react"
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "../stack";
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { MobileNav } from "@/components/mobile-nav"
import { Header } from "@/components/header"
import { QuickActions } from "@/components/quick-actions"
import { AuthProvider } from "@/lib/auth/auth-context"
import { ToastProvider } from "@/components/ui/toast"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import { RegisterServiceWorker } from "@/components/register-service-worker"
import Head from "next/head"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Farm Manager by Kamili",
  description: "Track and manage farms efficiently with Kamili's farm management solution",
  generator: 'Ian Kuria',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}><StackProvider app={stackServerApp}><StackTheme>
        <AuthProvider>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <PWAInstallPrompt />
            <RegisterServiceWorker />
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1 pb-16 md:pb-0">{children}</main>
              <div className="fixed bottom-0 left-0 z-50 w-full md:hidden">
                <MobileNav />
              </div>
              <QuickActions />
            </div>
          </ThemeProvider>
        </AuthProvider>
        <ToastProvider />
      </StackTheme></StackProvider></body>
    </html>
  )
}
