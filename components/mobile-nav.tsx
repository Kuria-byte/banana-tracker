"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Map, Calendar, Leaf, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Farms", href: "/farms", icon: Map },
  { name: "Tasks", href: "/tasks", icon: Calendar },
  { name: "Growth", href: "/growth", icon: Leaf },
  { name: "Reports", href: "/reports", icon: BarChart3 },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <div className="bg-background border-t">
      <nav className="flex justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center py-2 px-3",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
