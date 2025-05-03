"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { NavDropdown } from "@/components/ui/nav-dropdown"
import { primaryNavItems, secondaryNavItems, isPathActive } from "@/lib/navigation-config"

export function DesktopNav() {
  const pathname = usePathname()

  return (
    <nav className="hidden md:flex flex-col gap-1 p-2">
      {primaryNavItems.map((link) => {
        const isActive = isPathActive(pathname, link.href)
        const LinkIcon = link.icon

        return (
          <Link
            key={link.name}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground",
            )}
          >
            <LinkIcon className="h-5 w-5" />
            <span>{link.name}</span>
          </Link>
        )
      })}

      {/* More dropdown */}
      <div className="mt-1">
        <NavDropdown items={secondaryNavItems} />
      </div>
    </nav>
  )
}
