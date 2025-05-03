"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { type NavItem, isPathActive, isAnyChildActive } from "@/lib/navigation-config"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface NavDropdownProps {
  items: NavItem[]
  className?: string
  triggerClassName?: string
  contentClassName?: string
  itemClassName?: string
  iconClassName?: string
  variant?: "desktop" | "mobile"
}

export function NavDropdown({
  items,
  className,
  triggerClassName,
  contentClassName,
  itemClassName,
  iconClassName,
  variant = "desktop",
}: NavDropdownProps) {
  const pathname = usePathname()
  const isActive = items.some((item) => isPathActive(pathname, item.href) || isAnyChildActive(pathname, item.children))

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex items-center gap-1 rounded-lg px-3 py-2 text-sm transition-colors outline-none",
          isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground",
          variant === "mobile" && "flex-col text-xs min-w-[4rem]",
          triggerClassName,
        )}
      >
        <MoreHorizontal className={cn("h-5 w-5", iconClassName)} />
        <span>More</span>
        <ChevronDown className={cn("h-4 w-4 opacity-50", variant === "mobile" && "hidden")} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={cn("w-56", contentClassName)}>
        {items.map((item) => {
          const ItemIcon = item.icon
          const itemActive = isPathActive(pathname, item.href) || isAnyChildActive(pathname, item.children)

          // If the item has children, render a nested dropdown
          if (item.children) {
            return (
              <DropdownMenu key={item.name}>
                <DropdownMenuTrigger
                  className={cn(
                    "flex w-full items-center justify-between px-2 py-1.5 text-sm rounded-md",
                    itemActive ? "bg-muted" : "hover:bg-muted",
                    itemClassName,
                  )}
                >
                  <div className="flex items-center gap-2">
                    <ItemIcon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" className="w-48">
                  {item.children.map((child) => {
                    const ChildIcon = child.icon
                    const childActive = isPathActive(pathname, child.href)

                    return (
                      <DropdownMenuItem key={child.name} asChild>
                        <Link
                          href={child.href}
                          className={cn("flex items-center gap-2 w-full", childActive && "bg-muted")}
                        >
                          <ChildIcon className="h-4 w-4" />
                          <span>{child.name}</span>
                        </Link>
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )
          }

          // Otherwise, render a simple link
          return (
            <DropdownMenuItem key={item.name} asChild>
              <Link href={item.href} className={cn("flex items-center gap-2", itemActive && "bg-muted", itemClassName)}>
                <ItemIcon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
