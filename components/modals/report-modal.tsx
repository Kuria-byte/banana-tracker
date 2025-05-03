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
import { FileBarChart } from "lucide-react"
import { ReportForm } from "@/components/forms/report-form"

export function ReportModal() {
  const [open, setOpen] = useState(false)

  const handleSuccess = () => {
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileBarChart className="h-4 w-4" />
          <span>Generate Report</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Generate Financial Report</DialogTitle>
          <DialogDescription>Select the parameters for your financial report.</DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-1">
          <ReportForm onSuccess={handleSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
