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
import { TaskForm } from "@/components/forms/task-form"
import type { TaskFormValues } from "@/lib/validations/form-schemas"

interface TaskFormModalProps {
  trigger: React.ReactNode
  title: string
  description: string
  farmId?: string
  initialData?: Partial<TaskFormValues> & { id?: string }
}

export function TaskFormModal({ trigger, title, description, farmId, initialData }: TaskFormModalProps) {
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
        <TaskForm initialData={initialData} farmId={farmId} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  )
}
