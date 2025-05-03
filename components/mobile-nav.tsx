"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { NavDropdown } from "@/components/ui/nav-dropdown"
import { primaryNavItems, secondaryNavItems, isPathActive } from "@/lib/navigation-config"

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden flex justify-between items-center p-2 bg-background border-t">
      {primaryNavItems.map((link) => {
        const isActive = isPathActive(pathname, link.href)
        const LinkIcon = link.icon

        return (
          <Link
            key={link.name}
            href={link.href}
            className={cn(
              "flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs transition-colors min-w-[4rem]",
              isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground",
            )}
          >
            <LinkIcon className="h-5 w-5" />
            <span>{link.name}</span>
          </Link>
        )
      })}

      {/* More dropdown */}
      <NavDropdown items={secondaryNavItems} variant="mobile" />
    </nav>
  )
}
