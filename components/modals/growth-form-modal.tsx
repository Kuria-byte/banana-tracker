"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { GrowthForm } from "@/components/forms/growth-form"
import { recordEnhancedGrowth } from "@/app/actions/growth-actions"
import type { EnhancedGrowthFormValues } from "@/lib/validations/form-schemas"
import { useToast } from "@/hooks/use-toast"

export function GrowthFormModal() {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (values: EnhancedGrowthFormValues) => {
    const result = await recordEnhancedGrowth(values)

    if (result.success) {
      toast({
        title: "Success",
        description: result.message,
      })
      setOpen(false)
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Record Growth</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record Growth</DialogTitle>
          <DialogDescription>Record growth information for your banana plants.</DialogDescription>
        </DialogHeader>
        <GrowthForm onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  )
}
