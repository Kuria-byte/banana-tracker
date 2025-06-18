import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import type { ExpenseRecord } from '@/lib/types/owner-dashboard';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface ExpenseDetailsModalProps {
  expense: ExpenseRecord;
  open: boolean;
  onClose: () => void;
  onEdit?: () => void;
}

export function ExpenseDetailsModal({ expense, open, onClose, onEdit }: ExpenseDetailsModalProps) {
  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Expense Details</DialogTitle>
          <DialogDescription>View all details for this expense record.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <div><b>Date:</b> {format(new Date(expense.date), 'MMM d, yyyy')}</div>
          <div><b>Farm:</b> {expense.farmName}</div>
          <div><b>Category:</b> {expense.category}</div>
          <div><b>Amount:</b> {expense.amount}</div>
          <div><b>Description:</b> {expense.description}</div>
          <div><b>Status:</b> {expense.status}</div>
          <div><b>Payment Method:</b> {expense.paymentMethod}</div>
          <div><b>Notes:</b> {expense.notes}</div>
        </div>
        <DialogFooter>
          {onEdit && <Button onClick={onEdit}>Edit</Button>}
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 