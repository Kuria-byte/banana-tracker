import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import type { ExpenseRecord } from '@/lib/types/owner-dashboard';
import { Button } from '@/components/ui/button';
import { ExpenseForm } from '@/components/forms/expense-form';
import { toast } from '@/components/ui/use-toast';

interface ExpenseEditFormModalProps {
  expense: ExpenseRecord;
  open: boolean;
  onClose: () => void;
}

export function ExpenseEditFormModal({ expense, open, onClose }: ExpenseEditFormModalProps) {
  // TODO: Implement updateExpenseRecord action
  async function handleSubmit(values: any) {
    // Simulate update
    toast({ title: 'Expense updated', description: 'Expense record updated successfully.' });
    onClose();
  }
  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
        </DialogHeader>
        <ExpenseForm initialValues={expense} mode="edit" onSuccess={onClose} />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 