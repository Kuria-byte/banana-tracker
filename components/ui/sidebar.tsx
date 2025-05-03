"use client"

import * as React from "react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { TooltipProvider } from "@/components/ui/tooltip"

const SIDEBAR_COOKIE_NAME = "sidebar:state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContext = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContext | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }
>(({ defaultOpen = true, open: openProp, onOpenChange: setOpenProp, className, style, children, ...props }, ref) => {
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = React.useState(false)

  // This is the internal state of the sidebar.
  // We use openProp and setOpenProp for control from outside the component.
  const [_open, _setOpen] = React.useState(defaultOpen)
  const open = openProp ?? _open
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value
      if (setOpenProp) {
        setOpenProp(openState)
      } else {
        _setOpen(openState)
      }

      // This sets the cookie to keep the sidebar state.
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    },
    [setOpenProp, open],
  )

  // Helper to toggle the sidebar.
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open)
  }, [isMobile, setOpen, setOpenMobile])

  // Adds a keyboard shortcut to toggle the sidebar.
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar])

  // We add a state so that we can do data-state="expanded" or "collapsed".
  // This makes it easier to style the sidebar with Tailwind classes.
  const state = open ? "expanded" : "collapsed"

  const contextValue = React.useMemo<SidebarContext>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar],
  )

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn("group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar", className)}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  )
})
SidebarProvider.displayName = "SidebarProvider"

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    side?: "left" | "right"
    variant?: "sidebar" | "floating" | "inset"
    collapsible?: "offcanvas" | "icon" | "none"
  }
>(({ side = "left", variant = "sidebar", collapsible = "offcanvas", className, children, ...props }, ref) => {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

  if (collapsible === "none") {
    return (
      <div
        className={cn("flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground", className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    )
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          data-sidebar="sidebar"
          data-mobile="true"
          className="w-[--sidebar-width] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
            } as React.CSSProperties
          }
          side={side}
        >
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div
      ref={ref}
      className="group peer hidden md:block text-sidebar-foreground"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
    >
      {/* This is what handles the sidebar gap on desktop */}
      <div
        className={cn(
          "duration-200 relative h-svh w-[--sidebar-width] bg-transparent transition-[width] ease-linear",
          "group-data-[collapsible=offcanvas]:w-0",
          "group-data-[side=right]:rotate-180",
          variant === "floating" || variant === "inset"
            ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]"
            : "group-data-[collapsible=icon]:w-[--sidebar-width-icon]",
        )}
      />
      <div
        className={cn(
          "duration-200 fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width] flex-col bg-sidebar transition-[width,transform] ease-linear md:flex",
          "group-data-[collapsible=offcanvas]:-translate-x-full",
          "group-data-[side=right]:right-0 group-data-[side=right]:translate-x-0",
          "group-data-[side=right]:group-data-[collapsible=offcanvas]:translate-x-full",
          "group-data-[collapsible=icon]:w-[--sidebar-width-icon]",
          variant === "floating" && [
            "group-data-[side=left]:ml-4 group-data-[side=right]:mr-4",
            "group-data-[collapsible=icon]:group-data-[side=left]:ml-4 group-data-[collapsible=icon]:group-data-[side=right]:mr-4",
            "group-data-[collapsible=offcanvas]:ml-0 group-data-[collapsible=offcanvas]:mr-0",
            "my-4 rounded-xl",
          ],
          variant === "inset" && [
            "group-data-[side=left]:ml-4 group-data-[side=right]:mr-4",
            "group-data-[collapsible=icon]:group-data-[side=left]:ml-4 group-data-[collapsible=icon]:group-data-[side=right]:mr-4",
            "group-data-[collapsible=offcanvas]:ml-0 group-data-[collapsible=offcanvas]:mr-0",
            "my-4 rounded-xl",
          ],
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  )
})
Sidebar.displayName = "Sidebar"

const SidebarHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("flex h-14 items-center border-b px-4", className)} {...props} />
})
SidebarHeader.displayName = "SidebarHeader"

const SidebarContent = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("flex-1 overflow-auto", className)} {...props} />
})
SidebarContent.displayName = "SidebarContent"

const SidebarGroup = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("py-2", className)} {...props} />
})
SidebarGroup.displayName = "SidebarGroup"

const SidebarGroupLabel = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "px-4 py-1 text-xs font-medium text-muted-foreground",
          "group-[[data-collapsible=icon]]:sr-only",
          className,
        )}
        {...props}
      />
    )
  },
)
SidebarGroupLabel.displayName = "SidebarGroupLabel"

const SidebarGroupContent = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("px-2", className)} {...props} />
  },
)
SidebarGroupContent.displayName = "SidebarGroupContent"

const SidebarMenu = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(({ className, ...props }, ref) => {
  return <ul ref={ref} className={cn("grid gap-1", className)} {...props} />
})
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(({ className, ...props }, ref) => {
  return <li ref={ref} className={cn("", className)} {...props} />
})
SidebarMenuItem.displayName = "SidebarMenuItem"

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    isActive?: boolean
    asChild?: boolean
  }
>(({ className, isActive, asChild = false, ...props }, ref) => {
  const Comp = asChild ? React.Fragment : "button"
  return (
    <Comp
      ref={ref}
      className={cn(
        "group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium",
        "hover:bg-accent hover:text-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isActive && "bg-accent text-accent-foreground",
        className,
      )}
      {...props}
    />
  )
})
SidebarMenuButton.displayName = "SidebarMenuButton"

const SidebarInput = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    )
  },
)
SidebarInput.displayName = "SidebarInput"

const SidebarRail = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({ className, ...props }, ref) => {
  const { toggleSidebar } = useSidebar()
  return (
    <div
      ref={ref}
      className={cn(
        "absolute inset-y-0 right-0 z-20 w-px bg-border opacity-0 transition-opacity",
        "group-data-[collapsible=icon]:opacity-100",
        "group-data-[side=right]:left-0 group-data-[side=right]:right-auto",
        className,
      )}
      {...props}
    >
      <button
        type="button"
        className={cn(
          "absolute right-0 top-1/2 flex h-6 w-3 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border bg-background text-muted-foreground",
          "group-data-[side=right]:left-0 group-data-[side=right]:right-auto group-data-[side=right]:-translate-x-1/2 group-data-[side=right]:translate-x-0 group-data-[side=right]:rotate-180",
        )}
        onClick={toggleSidebar}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="m15 6-6 6 6 6" />
        </svg>
        <span className="sr-only">Toggle Sidebar</span>
      </button>
    </div>
  )
})
SidebarRail.displayName = "SidebarRail"

const SidebarTrigger = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button">>(
  ({ className, ...props }, ref) => {
    const { toggleSidebar } = useSidebar()
    return (
      <button
        type="button"
        ref={ref}
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium",
          "ring-offset-background transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          "md:hidden",
          className,
        )}
        onClick={toggleSidebar}
        {...props}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <path d="M9 3v18" />
        </svg>
        <span className="sr-only">Toggle Sidebar</span>
      </button>
    )
  },
)
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarInset = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({ className, ...props }, ref) => {
  const { state } = useSidebar()
  return (
    <div
      ref={ref}
      data-variant="inset"
      className={cn(
        "flex flex-1 flex-col",
        "peer-data-[state=expanded]:md:pl-[--sidebar-width]",
        "peer-data-[collapsible=icon]:peer-data-[state=collapsed]:md:pl-[--sidebar-width-icon]",
        "peer-data-[side=right]:peer-data-[state=expanded]:md:pl-0 peer-data-[side=right]:peer-data-[state=expanded]:md:pr-[--sidebar-width]",
        "peer-data-[side=right]:peer-data-[collapsible=icon]:peer-data-[state=collapsed]:md:pl-0 peer-data-[side=right]:peer-data-[collapsible=icon]:peer-data-[state=collapsed]:md:pr-[--sidebar-width-icon]",
        className,
      )}
      {...props}
    />
  )
})
SidebarInset.displayName = "SidebarInset"

export {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
}
