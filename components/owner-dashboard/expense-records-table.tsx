"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { getAllExpenseRecords } from "@/app/actions/owner-dashboard-actions"
import { formatCurrency } from "@/lib/utils/currency-formatter"
import { format } from "date-fns"
import { Loader2, MoreHorizontal } from "lucide-react"
import type { ExpenseRecord, DashboardPeriod } from "@/lib/types/owner-dashboard"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ExpenseRecordsTable() {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<DashboardPeriod>("month")
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredExpenses, setFilteredExpenses] = useState<ExpenseRecord[]>([])

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
          expense.description.toLowerCase().includes(lowercaseSearch),
      )
      setFilteredExpenses(filtered)
    }
  }, [expenses, searchTerm])

  const handleExport = () => {
    // In a real app, this would generate a CSV file
    alert("Export functionality would be implemented here")
  }

  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Farm</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount (KES)</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading records...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredExpenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No expense records found.
                </TableCell>
              </TableRow>
            ) : (
              filteredExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{format(new Date(expense.date), "MMM d, yyyy")}</TableCell>
                  <TableCell>{expense.farmName}</TableCell>
                  <TableCell>{expense.category}</TableCell>
                  <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
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
                        <DropdownMenuItem>View details</DropdownMenuItem>
                        <DropdownMenuItem>Edit record</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">Delete record</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
