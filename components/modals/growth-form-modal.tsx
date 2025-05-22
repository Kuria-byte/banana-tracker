"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { GrowthForm } from "@/components/forms/growth-form"
import { recordEnhancedGrowth, recordBulkGrowth } from "@/app/actions/growth-actions"
import type { EnhancedGrowthFormValues } from "@/lib/validations/form-schemas"
import { useToast } from "@/hooks/use-toast"

interface GrowthFormModalProps {
  trigger?: React.ReactNode
  initialValues?: Partial<EnhancedGrowthFormValues>
  mode?: 'individual' | 'bulk'
  bulkSummary?: { plotName: string, plantCount: number }
  farms?: any[]
  plots?: any[]
  users?: any[]
  hole?: any
}

export function GrowthFormModal({ trigger, initialValues, mode = 'individual', bulkSummary, farms = [], plots = [], users = [], hole }: GrowthFormModalProps = {}) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (values: EnhancedGrowthFormValues) => {
    let result
    if (mode === 'bulk') {
      result = await recordBulkGrowth({
        farmId: values.farmId!,
        plotId: values.plotId!,
        stage: values.stage!,
        date: values.date!,
        notes: values.notes,
        workerId: values.workerId,
      })
    } else {
      result = await recordEnhancedGrowth(values)
    }

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
    return result;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || <Button>Record Growth</Button>}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
        <DialogHeader>
          <DialogTitle>{mode === 'bulk' ? 'Bulk Record Growth' : 'Record Growth'}</DialogTitle>
          <DialogDescription>
            {mode === 'bulk'
              ? `This will record growth for all planted holes in plot "${bulkSummary?.plotName}" (${bulkSummary?.plantCount} plants).`
              : 'Record growth information for your banana plants.'}
          </DialogDescription>
        </DialogHeader>
        <GrowthForm 
          onSubmit={handleSubmit} 
          defaultValues={initialValues} 
          mode={mode} 
          bulkSummary={bulkSummary} 
          farms={farms} 
          plots={plots} 
          users={users} 
          hole={hole}
          onSuccess={() => setOpen(false)}
        />
        <div className="mt-6 flex justify-end">
          <DialogClose asChild>
            <Button variant="outline" className="mr-2">
              Cancel
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}
