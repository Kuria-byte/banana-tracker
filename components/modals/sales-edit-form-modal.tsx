import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { SalesForm } from '@/components/forms/sales-form';
import type { SalesRecord, SalesFormData } from '@/lib/types/owner-dashboard';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

// TODO: Replace with real updateSaleRecord action
async function updateSaleRecord(id: number, data: SalesFormData) {
  // Simulate API call
  return { success: true };
}

interface SalesEditFormModalProps {
  sale: SalesRecord;
  open: boolean;
  onClose: () => void;
}

export function SalesEditFormModal({ sale, open, onClose }: SalesEditFormModalProps) {
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(values: SalesFormData) {
    setIsSaving(true);
    try {
      const result = await updateSaleRecord(sale.id, values);
      if (result.success) {
        toast({ title: 'Sale updated', description: 'The sale record was updated successfully.' });
        onClose();
      } else {
        toast({ title: 'Error updating sale', description: result.error || 'Unknown error', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error updating sale', description: 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Sale</DialogTitle>
          <DialogDescription>Update the details of this sale record below.</DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-1">
          <SalesForm initialValues={sale} mode="edit" onSuccess={onClose} />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
} 