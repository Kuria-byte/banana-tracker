"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { getAllExpenseRecords, updateExpenseRecord, deleteExpenseRecord } from "@/app/actions/owner-dashboard-actions"
import { formatCurrency } from "@/lib/utils/currency-formatter"
import { format } from "date-fns"
import { Loader2, MoreHorizontal, ArrowUp, ArrowDown } from "lucide-react"
import type { ExpenseRecord, DashboardPeriod } from "@/lib/types/owner-dashboard"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from '@/components/ui/use-toast'
import { ExpenseDetailsModal } from '@/components/modals/expense-details-modal';
import { ExpenseEditFormModal } from '@/components/modals/expense-edit-form-modal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ExpenseForm } from '@/components/forms/expense-form';
import * as XLSX from 'xlsx';

export function ExpenseRecordsTable() {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<DashboardPeriod>("month")
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredExpenses, setFilteredExpenses] = useState<ExpenseRecord[]>([])
  const [sortBy, setSortBy] = useState<'date' | 'farmName' | 'category' | 'amount' | 'status' | 'paymentMethod'>('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [selectedExpense, setSelectedExpense] = useState<ExpenseRecord | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'xlsx'>('csv');

  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true)
      try {
        const result = await getAllExpenseRecords(period)
        if (result.success && result.data) {
          setExpenses(result.data)
        }
      } catch (error) {
        console.error("Error fetching expense records:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchExpenses()
  }, [period])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredExpenses(expenses)
    } else {
      const lowercaseSearch = searchTerm.toLowerCase()
      const filtered = expenses.filter(
        (expense) =>
          expense.category.toLowerCase().includes(lowercaseSearch) ||
          expense.description.toLowerCase().includes(lowercaseSearch) ||
          (expense.farmName || '').toLowerCase().includes(lowercaseSearch)
      )
      setFilteredExpenses(filtered)
    }
  }, [expenses, searchTerm])

  function handleSort(column: typeof sortBy) {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortDirection('asc')
    }
  }

  function getSortIcon(column: typeof sortBy) {
    if (sortBy !== column) return null
    return sortDirection === 'asc' ? <ArrowUp className="inline h-4 w-4 ml-1" /> : <ArrowDown className="inline h-4 w-4 ml-1" />
  }

  function sortExpenses(data: ExpenseRecord[]) {
    return [...data].sort((a, b) => {
      let aValue: any = a[sortBy]
      let bValue: any = b[sortBy]
      if (sortBy === 'date') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const cmp = aValue.localeCompare(bValue)
        return sortDirection === 'asc' ? cmp : -cmp
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
      }
      return 0
    })
  }

  const sortedExpenses = sortExpenses(filteredExpenses)

  // CSV export utility
  function exportExpensesToCSV() {
    const headers = [
      'Date', 'Farm', 'Category', 'Amount (KES)', 'Status', 'Payment Method', 'Description'
    ];
    const rows = sortedExpenses.map((expense) => [
      format(new Date(expense.date), 'dd/MM/yyyy'),
      expense.farmName || '',
      expense.category,
      expense.amount,
      expense.status || '',
      expense.paymentMethod || '',
      expense.description || '',
    ]);
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense-records-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: 'Export Successful', description: 'Expense records exported as CSV.' });
  }

  function exportExpensesToXLSX() {
    const rows = sortedExpenses.map((expense) => ({
      Date: format(new Date(expense.date), 'dd/MM/yyyy'),
      Farm: expense.farmName || '',
      Category: expense.category,
      'Amount (KES)': expense.amount,
      Status: expense.status || '',
      'Payment Method': expense.paymentMethod || '',
      Description: expense.description || '',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Expenses');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense-records-${new Date().toISOString().slice(0,10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: 'Export Successful', description: 'Expense records exported as Excel.' });
  }

  const handleExport = () => {
    if (exportFormat === 'csv') exportExpensesToCSV();
    else exportExpensesToXLSX();
  }

  async function handleDelete() {
    if (!selectedExpense) return;
    const result = await deleteExpenseRecord(selectedExpense.id);
    setShowDelete(false);
    if (result.success) {
      setExpenses(prev => prev.filter(e => e.id !== selectedExpense.id));
      setFilteredExpenses(prev => prev.filter(e => e.id !== selectedExpense.id));
      setSelectedExpense(null);
      toast({ title: 'Expense deleted', description: 'Expense record deleted successfully.' });
    } else {
      toast({ title: 'Error deleting expense', description: result.error || 'Failed to delete expense.', variant: 'destructive' });
    }
  }

  return (
    <div className="rounded-md border">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 p-2">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search category, farm, or description..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full md:w-64 px-2 py-1 border rounded text-sm"
          />
        </div>
        <div className="flex gap-2 items-center">
          <label htmlFor="export-format" className="sr-only">Export Format</label>
          <select id="export-format" aria-label="Export Format" value={exportFormat} onChange={e => setExportFormat(e.target.value as 'csv' | 'xlsx')} className="border rounded px-2 py-1 text-sm">
            <option value="csv">CSV</option>
            <option value="xlsx">Excel</option>
          </select>
          <Button variant="outline" size="sm" onClick={handleExport}>
            Export
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort('date')} className="cursor-pointer select-none">
                Date {getSortIcon('date')}
              </TableHead>
              <TableHead onClick={() => handleSort('farmName')} className="cursor-pointer select-none">
                Farm {getSortIcon('farmName')}
              </TableHead>
              <TableHead onClick={() => handleSort('category')} className="cursor-pointer select-none">
                Category {getSortIcon('category')}
              </TableHead>
              <TableHead onClick={() => handleSort('amount')} className="text-right cursor-pointer select-none">
                Amount (KES) {getSortIcon('amount')}
              </TableHead>
              <TableHead onClick={() => handleSort('status')} className="cursor-pointer select-none">
                Status {getSortIcon('status')}
              </TableHead>
              <TableHead onClick={() => handleSort('paymentMethod')} className="cursor-pointer select-none">
                Payment Method {getSortIcon('paymentMethod')}
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading records...
                  </div>
                </TableCell>
              </TableRow>
            ) : sortedExpenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No expense records found.
                </TableCell>
              </TableRow>
            ) : (
              sortedExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{format(new Date(expense.date), "MMM d, yyyy")}</TableCell>
                  <TableCell>{expense.farmName}</TableCell>
                  <TableCell>{expense.category}</TableCell>
                  <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                  <TableCell>{expense.status}</TableCell>
                  <TableCell>{expense.paymentMethod}</TableCell>
                  <TableCell>
                    {expense.description && expense.description.length > 32 ? (
                      <span title={expense.description}>{expense.description.slice(0, 32)}&hellip;</span>
                    ) : (
                      expense.description
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => { setSelectedExpense(expense); setShowDetails(true); }}>View details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setSelectedExpense(expense); setShowEdit(true); }}>Edit record</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => { setSelectedExpense(expense); setShowDelete(true); }}>Delete record</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {/* Modals */}
      {selectedExpense && (
        <ExpenseDetailsModal
          expense={selectedExpense}
          open={showDetails}
          onClose={() => setShowDetails(false)}
          onEdit={() => { setShowDetails(false); setShowEdit(true); }}
        />
      )}
      {selectedExpense && (
        <ExpenseEditFormModal
          expense={selectedExpense}
          open={showEdit}
          onClose={() => setShowEdit(false)}
        />
      )}
      {/* Delete confirmation dialog */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Expense</DialogTitle>
            <DialogDescription>Are you sure you want to delete this expense record? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ExpenseEditFormModal({ expense, open, onClose }: ExpenseEditFormModalProps) {
  async function handleEditSubmit(values: any) {
    const result = await updateExpenseRecord(expense.id, values);
    if (result.success) {
      toast({ title: 'Expense updated', description: 'Expense record updated successfully.' });
      onClose();
    } else {
      toast({ title: 'Error updating expense', description: result.error || 'Failed to update expense.', variant: 'destructive' });
    }
  }
  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
        </DialogHeader>
        <ExpenseForm initialValues={expense} mode="edit" onSuccess={onClose} onSubmit={handleEditSubmit} />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
