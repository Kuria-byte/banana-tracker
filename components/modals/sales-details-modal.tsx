import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { SalesForm } from '@/components/forms/sales-form';
import type { SalesRecord } from '@/lib/types/owner-dashboard';
import { Button } from '@/components/ui/button';

interface SalesDetailsModalProps {
  sale: SalesRecord;
  open: boolean;
  onClose: () => void;
  onEdit?: () => void;
}

export function SalesDetailsModal({ sale, open, onClose, onEdit }: SalesDetailsModalProps) {
  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Sale Details</DialogTitle>
          <DialogDescription>View all details for this sale record.</DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-1">
          <SalesForm initialValues={sale} mode="view" />
          <div className="mt-6">
            <h4 className="font-semibold mb-2">Harvest Details</h4>
            {sale.harvestRecordId && (sale.harvestDate || sale.harvestBunchCount || sale.harvestWeight) ? (
              <ul className="text-sm space-y-1">
                {sale.harvestDate && <li>Date: {new Date(sale.harvestDate).toLocaleDateString()}</li>}
                {sale.harvestBunchCount !== undefined && sale.harvestBunchCount !== null && <li>Bunches: {sale.harvestBunchCount}</li>}
                {sale.harvestWeight !== undefined && sale.harvestWeight !== null && <li>Weight: {sale.harvestWeight} kg</li>}
              </ul>
            ) : (
              <span className="text-muted-foreground">No harvest record linked.</span>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          {onEdit && <Button variant="outline" onClick={onEdit}>Edit</Button>}
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
} 