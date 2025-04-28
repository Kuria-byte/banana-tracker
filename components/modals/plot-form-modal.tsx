"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PlotForm } from "@/components/forms/plot-form"
import type { PlotFormValues } from "@/lib/validations/form-schemas"

interface PlotFormModalProps {
  trigger: React.ReactNode
  title: string
  description: string
  farmId?: string
  initialData?: Partial<PlotFormValues> & { id?: string }
}

export function PlotFormModal({ trigger, title, description, farmId, initialData }: PlotFormModalProps) {
  const [open, setOpen] = useState(false)

  const handleSuccess = () => {
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <PlotForm initialData={initialData} farmId={farmId} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  )
}
