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
import { PlusCircle } from "lucide-react"
import { ExpenseForm } from "@/components/forms/expense-form"

export function ExpenseFormModal() {
  const [open, setOpen] = useState(false)

  const handleSuccess = () => {
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <PlusCircle className="h-4 w-4" />
          <span>Record Expense</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Record New Expense</DialogTitle>
          <DialogDescription>Enter the details of the expense transaction below.</DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-1">
          <ExpenseForm onSuccess={handleSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
