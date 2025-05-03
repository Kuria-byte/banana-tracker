"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getAllSalesRecords } from "@/app/actions/owner-dashboard-actions"
import { formatCurrency } from "@/lib/utils/currency-formatter"
import { format } from "date-fns"
import { Search, FileDown, Loader2, MoreHorizontal } from "lucide-react"
import type { SalesRecord, DashboardPeriod } from "@/lib/types/owner-dashboard"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function SalesRecordsTable() {
  const [sales, setSales] = useState<SalesRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<DashboardPeriod>("month")
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredSales, setFilteredSales] = useState<SalesRecord[]>([])

  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true)
      try {
        const result = await getAllSalesRecords(period)
        if (result.success && result.data) {
          setSales(result.data)
        }
      } catch (error) {
        console.error("Error fetching sales records:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSales()
  }, [period])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredSales(sales)
    } else {
      const lowercaseSearch = searchTerm.toLowerCase()
      const filtered = sales.filter(
        (sale) =>
          sale.product.toLowerCase().includes(lowercaseSearch) ||
          sale.buyerName.toLowerCase().includes(lowercaseSearch),
      )
      setFilteredSales(filtered)
    }
  }, [sales, searchTerm])

  const handleExport = () => {
    // In a real app, this would generate a CSV file
    alert("Export functionality would be implemented here")
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Sales Records</CardTitle>
            <CardDescription>
              {period === "week"
                ? "Last 7 days"
                : period === "month"
                  ? "Last 30 days"
                  : period === "quarter"
                    ? "Last 3 months"
                    : "Last 12 months"}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input
                placeholder="Search products or buyers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-[200px]"
              />
              <Select value={period} onValueChange={(value) => setPeriod(value as DashboardPeriod)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="quarter">Quarter</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={handleExport}>
                <FileDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <p>Loading sales records...</p>
          </div>
        ) : filteredSales.length === 0 ? (
          <div className="flex h-40 items-center justify-center">
            <div className="text-center">
              <Search className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-lg font-medium">No sales records found</p>
              <p className="text-sm text-muted-foreground">
                {searchTerm ? "Try a different search term" : "Try selecting a different time period"}
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Farm</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Amount (KES)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        <div className="flex items-center justify-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading records...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredSales.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No sales records found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>{format(new Date(sale.date), "MMM d, yyyy")}</TableCell>
                        <TableCell>{sale.buyerName}</TableCell>
                        <TableCell>{sale.product}</TableCell>
                        <TableCell className="text-right">{formatCurrency(sale.totalAmount)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              sale.paymentStatus === "Paid"
                                ? "success"
                                : sale.paymentStatus === "Partial"
                                  ? "outline"
                                  : "secondary"
                            }
                          >
                            {sale.paymentStatus}
                          </Badge>
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
        )}
      </CardContent>
    </Card>
  )
}
