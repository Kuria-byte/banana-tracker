import { BarChart3, Home, Leaf, Settings, Users, BookOpen, Map, ShoppingCart, Sprout, Zap } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type NavItem = {
  name: string
  href: string
  icon: LucideIcon
  children?: NavItem[]
}

// Primary navigation items (visible in main nav)
export const primaryNavItems: NavItem[] = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Farms", href: "/farms", icon: Map },
  { name: "Tasks", href: "/tasks", icon: Leaf },
  // { name: "Reports", href: "/reports", icon: BarChart3   },
  { name: "Assistant", href: "/assistant", icon: Zap },
]

// Secondary navigation items (hidden under "More" dropdown)
export const secondaryNavItems: NavItem[] = [
  { name: "Team", href: "/team", icon: Users },
  { name: "Knowledge", href: "/knowledge", icon: BookOpen },
  {
    name: "Owner Dashboard",
    href: "/owner-dashboard",
    icon: BarChart3,
    children: [
      { name: "Overview", href: "/owner-dashboard", icon: BarChart3 },
      { name: "Financial Records", href: "/owner-dashboard/financial-records", icon: BarChart3 },
      { name: "Buyers", href: "/owner-dashboard/buyers", icon: ShoppingCart },
    ],
  },
  { name: "Settings", href: "/settings", icon: Settings },
]

// Helper function to check if a path is active
export function isPathActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === href
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

// Helper function to check if any child path is active
export function isAnyChildActive(pathname: string, children?: NavItem[]): boolean {
  if (!children) return false
  return children.some((child) => isPathActive(pathname, child.href))
}
