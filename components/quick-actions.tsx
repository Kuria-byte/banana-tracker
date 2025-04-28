"use client"

import type React from "react"

import { useState } from "react"
import { Plus, X, CalendarPlus, Leaf, Map, AlertTriangle, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { FarmFormModal } from "@/components/modals/farm-form-modal"
import { PlotFormModal } from "@/components/modals/plot-form-modal"
import { TaskFormModal } from "@/components/modals/task-form-modal"
import { GrowthFormModal } from "@/components/modals/growth-form-modal"

interface QuickAction {
  label: string
  icon: React.ReactNode
  modal: React.ReactNode
  color?: string
}

export function QuickActions() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Get current farm ID if on a farm page
  const farmId = pathname.startsWith("/farms/") ? pathname.split("/")[2] : undefined

  // Define context-aware actions based on current path
  const getContextActions = (): QuickAction[] => {
    const baseActions: QuickAction[] = [
      {
        label: "Add Task",
        icon: <CalendarPlus className="h-5 w-5" />,
        modal: (
          <TaskFormModal
            trigger={<div className="sr-only">Add Task</div>}
            title="Add New Task"
            description="Create a new task for your farm"
            farmId={farmId}
          />
        ),
        color: "bg-blue-500 hover:bg-blue-600",
      },
      {
        label: "Record Growth",
        icon: <Leaf className="h-5 w-5" />,
        modal: (
          <GrowthFormModal
            trigger={<div className="sr-only">Record Growth</div>}
            title="Record Growth Stage"
            description="Record a growth stage for a banana plant"
            initialData={farmId ? { farmId } : undefined}
          />
        ),
        color: "bg-green-500 hover:bg-green-600",
      },
      {
        label: "Add Farm",
        icon: <Map className="h-5 w-5" />,
        modal: (
          <FarmFormModal
            trigger={<div className="sr-only">Add Farm</div>}
            title="Add New Farm"
            description="Create a new banana plantation"
          />
        ),
        color: "bg-amber-500 hover:bg-amber-600",
      },
    ]

    // Add context-specific actions
    if (pathname.startsWith("/farms/")) {
      baseActions.unshift({
        label: "Add Plot",
        icon: <Map className="h-5 w-5" />,
        modal: (
          <PlotFormModal
            trigger={<div className="sr-only">Add Plot</div>}
            title="Add New Plot"
            description="Create a new plot for this farm"
            farmId={farmId}
          />
        ),
        color: "bg-purple-500 hover:bg-purple-600",
      })
    } else if (pathname.startsWith("/tasks")) {
      baseActions.unshift({
        label: "Assign Task",
        icon: <CalendarPlus className="h-5 w-5" />,
        modal: (
          <TaskFormModal
            trigger={<div className="sr-only">Assign Task</div>}
            title="Assign New Task"
            description="Create and assign a new task"
          />
        ),
        color: "bg-indigo-500 hover:bg-indigo-600",
      })
    } else if (pathname.startsWith("/growth")) {
      baseActions.unshift({
        label: "Log Harvest",
        icon: <Leaf className="h-5 w-5" />,
        modal: (
          <GrowthFormModal
            trigger={<div className="sr-only">Log Harvest</div>}
            title="Record Harvest"
            description="Record a harvest for a banana plant"
          />
        ),
        color: "bg-emerald-500 hover:bg-emerald-600",
      })
    } else if (pathname.startsWith("/reports")) {
      baseActions.unshift({
        label: "Generate Report",
        icon: <FileText className="h-5 w-5" />,
        modal: <div className="sr-only">Generate Report</div>,
        color: "bg-orange-500 hover:bg-orange-600",
      })
    } else {
      baseActions.unshift({
        label: "Report Issue",
        icon: <AlertTriangle className="h-5 w-5" />,
        modal: <div className="sr-only">Report Issue</div>,
        color: "bg-red-500 hover:bg-red-600",
      })
    }

    return baseActions.slice(0, 4) // Limit to 4 actions
  }

  const actions = getContextActions()

  return (
    <div className="fixed bottom-20 right-4 md:bottom-8 z-40 flex flex-col-reverse items-center gap-2">
      {isOpen && (
        <div className="flex flex-col-reverse gap-2">
          <TooltipProvider>
            {actions.map((action, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    className={cn(
                      "rounded-full shadow-lg text-white",
                      action.color || "bg-primary hover:bg-primary/90",
                    )}
                    onClick={() => {
                      // Keep the menu open for now
                      // We'll close it when the modal is closed
                    }}
                  >
                    {action.icon}
                    <span className="sr-only">{action.label}</span>
                    {action.modal}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>{action.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      )}
      <Button
        size="icon"
        className={cn(
          "rounded-full shadow-lg",
          isOpen ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90",
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
        <span className="sr-only">{isOpen ? "Close menu" : "Open menu"}</span>
      </Button>
    </div>
  )
}
