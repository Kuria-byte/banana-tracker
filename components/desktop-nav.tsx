"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Map, Calendar, Leaf, BarChart3, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"

const navItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Farms", href: "/farms", icon: Map },
  { name: "Tasks", href: "/tasks", icon: Calendar },
  { name: "Growth", href: "/growth", icon: Leaf },
  { name: "Reports", href: "/reports", icon: BarChart3 },
]

export function DesktopNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-14 items-center">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="mr-2 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[300px]">
            <nav className="flex flex-col gap-4 mt-6">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md",
                      isActive ? "bg-muted text-primary font-medium" : "text-muted-foreground",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </SheetContent>
        </Sheet>
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Leaf className="h-5 w-5 text-primary" />
          <span>Banana Tracker</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 mx-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                {item.name}
              </Link>
            )
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm">
            Kimani
          </Button>
        </div>
      </div>
    </header>
  )
}
