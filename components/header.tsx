"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Leaf,
  Bell,
  Search,
  Menu,
  X,
  Moon,
  Sun,
  ChevronDown,
  LogOut,
  Settings,
  UserIcon,
  HelpCircle,
  MoreVertical,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useTheme } from "next-themes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { UserButton } from '@stackframe/stack';

const navItems = [
  { name: "Dashboard", href: "/" },
  { name: "Farms", href: "/farms" },
  { name: "Tasks", href: "/tasks" },
  { name: "Assistant", href: "/assistant" },
  { name: "Reports", href: "/reports" },
]
  
export function Header() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const { setTheme, theme } = useTheme()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <div className="flex items-center gap-2 mb-8">
                <Leaf className="h-5 w-5 text-primary" />
                <div className="flex flex-col">
                  <span className="font-semibold">Farm Manager</span>
                  <span className="text-xs text-muted-foreground">
                    by Kamili
                  </span>
                </div>
              </div>
              <nav className="flex flex-col gap-4">
                {navItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-md",
                        isActive
                          ? "bg-muted text-primary font-medium"
                          : "text-muted-foreground"
                      )}
                    >
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-primary" />
            <div className="hidden sm:flex flex-col leading-none">
              <span className="font-semibold">Farm Manager</span>
              <span className="text-xs text-muted-foreground">by Kamili</span>
            </div>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6 mx-6">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {/* Desktop view - show all icons */}
          <div className="hidden md:flex items-center gap-2">
            {showSearch ? (
              <div className="relative flex items-center">
                <Input
                  placeholder="Search..."
                  className="w-[200px] pr-8"
                  autoFocus
                  onBlur={() => setShowSearch(false)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0"
                  onClick={() => setShowSearch(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSearch(true)}
              >
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>
            )}

            <Link href="/help">
              <Button variant="ghost" size="icon">
                <HelpCircle className="h-5 w-5" />
                <span className="sr-only">Help</span>
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>

          {/* Mobile view - only show notifications and more menu */}
          <div className="flex md:hidden items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    3
                  </Badge>
                  <span className="sr-only">Notifications</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[300px]">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[300px] overflow-auto">
                  <div className="p-2 hover:bg-muted rounded-md cursor-pointer">
                    <p className="text-sm font-medium">Task assigned to you</p>
                    <p className="text-xs text-muted-foreground">
                      Apply fertilizer to Karii East Farm
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      2 hours ago
                    </p>
                  </div>
                  <div className="p-2 hover:bg-muted rounded-md cursor-pointer">
                    <p className="text-sm font-medium">Harvest reminder</p>
                    <p className="text-xs text-muted-foreground">
                      Karii East Farm - Plot B is ready for harvest
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Yesterday
                    </p>
                  </div>
                  <div className="p-2 hover:bg-muted rounded-md cursor-pointer">
                    <p className="text-sm font-medium">Health alert</p>
                    <p className="text-xs text-muted-foreground">
                      Pest detected in Kangai South Farm
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      2 days ago
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-center"
                >
                  View all notifications
                </Button>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* More menu for mobile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowSearch(true)}>
                  <Search className="mr-2 h-4 w-4" />
                  <span>Search</span>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/help">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Help</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? (
                    <Sun className="mr-2 h-4 w-4" />
                  ) : (
                    <Moon className="mr-2 h-4 w-4" />
                  )}
                  <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* User dropdown - both mobile and desktop */}
          <UserButton
            showUserInfo={false}
            colorModeToggle={() => {
              console.log("color mode toggle clicked");
            }}
            extraItems={[
              {
                text: "Custom Action",
                icon: <UserIcon />,
                onClick: () => console.log("Custom action clicked"),
              },
            ]}
          />
        </div>
      </div>
    </header>
  );
}
