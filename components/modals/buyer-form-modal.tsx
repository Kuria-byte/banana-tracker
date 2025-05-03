"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { BuyerForm } from "@/components/forms/buyer-form"
import type { BuyerFormData } from "@/lib/types/buyer"

interface BuyerFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: BuyerFormData) => Promise<void>
  defaultValues?: Partial<BuyerFormData>
  title?: string
}

export function BuyerFormModal({
  isOpen,
  onClose,
  onSubmit,
  defaultValues,
  title = "Add New Buyer",
}: BuyerFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: BuyerFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
      onClose()
    } catch (error) {
      console.error("Error submitting buyer form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto pr-1">
          <BuyerForm onSubmit={handleSubmit} defaultValues={defaultValues} isSubmitting={isSubmitting} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
