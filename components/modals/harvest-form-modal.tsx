"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { HarvestForm } from "@/components/forms/harvest-form"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import type { HarvestFormValues } from "@/lib/validations/form-schemas"

interface HarvestFormModalProps {
  trigger: React.ReactNode
  title: string
  description: string
  initialData?: Partial<HarvestFormValues>
  users: { id: string; name: string }[]
  plots: { id: string; name: string }[]
  farmId: string
}

export function HarvestFormModal({
  trigger,
  title,
  description,
  initialData,
  users,
  plots,
  farmId,
}: HarvestFormModalProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Close dialog when ESC key is pressed
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [])

  // Handle successful form submission
  const handleSuccess = () => {
    // Refresh the data
    router.refresh()
    
    // Close the modal
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2">Loading...</span>
          </div>
        ) : (
          <HarvestForm
            initialData={initialData}
            users={users}
            plots={plots}
            farmId={farmId}
            onSuccess={handleSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}