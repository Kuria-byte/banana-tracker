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
import { FarmForm } from "@/components/forms/farm-form"
import type { FarmFormValues } from "@/lib/validations/form-schemas"

interface FarmFormModalProps {
  trigger: React.ReactNode
  title: string
  description: string
  initialData?: Partial<FarmFormValues> & { id?: string }
}

export function FarmFormModal({ trigger, title, description, initialData }: FarmFormModalProps) {
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
        <FarmForm initialData={initialData} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  )
}
