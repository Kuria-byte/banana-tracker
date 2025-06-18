  "use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getAllSalesRecords, getHarvestConversionSummaryAction } from "@/app/actions/owner-dashboard-actions"
import { formatCurrency } from "@/lib/utils/currency-formatter"
import { format } from "date-fns"
import { Search, FileDown, Loader2, MoreHorizontal, ArrowUp, ArrowDown } from "lucide-react"
import type { SalesRecord, DashboardPeriod } from "@/lib/types/owner-dashboard"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SalesDetailsModal } from '@/components/modals/sales-details-modal';
import { SalesEditFormModal } from '@/components/modals/sales-edit-form-modal';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { toast } from '@/components/ui/use-toast';

export function SalesRecordsTable() {
  const [sales, setSales] = useState<SalesRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<DashboardPeriod>("month")
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredSales, setFilteredSales] = useState<SalesRecord[]>([])
  const [selectedSale, setSelectedSale] = useState<SalesRecord | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [sortBy, setSortBy] = useState<'date' | 'buyerName' | 'product' | 'totalAmount' | 'paymentStatus'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [harvestConversionMap, setHarvestConversionMap] = useState<Record<number, number>>({});

  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true)
      try {
        const result = await getAllSalesRecords(period)
        if (result.success && result.data) {
          setSales(result.data.map((sale: any) => ({
            ...sale,
            id: Number(sale.id),
            buyerId: Number(sale.buyerId),
            farmId: Number(sale.farmId),
            plotId: sale.plotId !== undefined && sale.plotId !== null ? Number(sale.plotId) : undefined,
            userId: sale.userId !== undefined && sale.userId !== null ? Number(sale.userId) : undefined,
            harvestRecordId: sale.harvestRecordId !== undefined && sale.harvestRecordId !== null ? Number(sale.harvestRecordId) : undefined,
          })))
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

  useEffect(() => {
    // Fetch conversion rates for all harvests in the period
    async function fetchHarvestConversion() {
      const res = await getHarvestConversionSummaryAction(period);
      if (res.success && Array.isArray(res.data)) {
        const map: Record<number, number> = {};
        res.data.forEach((h: any) => {
          if (h.id != null) map[h.id] = h.conversionRate;
        });
        setHarvestConversionMap(map);
      } else {
        setHarvestConversionMap({});
      }
    }
    fetchHarvestConversion();
  }, [period]);

  // CSV export utility
  function exportSalesToCSV() {
    const headers = [
      'Date', 'Buyer', 'Farm', 'Product', 'Harvest Summary', 'Amount (KES)', 'Status', 'Conversion Rate'
    ];
    // Helper for CSV-friendly harvest summary
    function csvHarvestSummary(sale: SalesRecord) {
      if (!sale.harvestDate && !sale.harvestBunchCount && !sale.harvestWeight) return '-';
      const date = sale.harvestDate ? format(new Date(sale.harvestDate), 'dd/MM/yyyy') : '';
      const bunches = sale.harvestBunchCount !== undefined && sale.harvestBunchCount !== null ? `${sale.harvestBunchCount} bunches` : '';
      const weight = sale.harvestWeight !== undefined && sale.harvestWeight !== null ? `${sale.harvestWeight} kg` : '';
      return [date, bunches, weight].filter(Boolean).join(' | ');
    }
    const rows = sortedSales.map((sale) => [
      format(new Date(sale.date), 'dd/MM/yyyy'),
      sale.buyerName,
      sale.farmName || '',
      sale.product,
      csvHarvestSummary(sale),
      sale.totalAmount,
      sale.paymentStatus,
      (sale.harvestRecordId && harvestConversionMap[sale.harvestRecordId] !== undefined)
        ? `${harvestConversionMap[sale.harvestRecordId].toFixed(2)}%`
        : '-',
    ]);
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-records-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: 'Export Successful', description: 'Sales records exported as CSV.' });
  }

  const handleExport = () => {
    exportSalesToCSV();
  }

  // Sorting logic
  function handleSort(column: typeof sortBy) {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  }

  function getSortIcon(column: typeof sortBy) {
    if (sortBy !== column) return null;
    return sortDirection === 'asc' ? <ArrowUp className="inline h-4 w-4 ml-1" /> : <ArrowDown className="inline h-4 w-4 ml-1" />;
  }

  function sortSales(data: SalesRecord[]) {
    return [...data].sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];
      if (sortBy === 'date') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const cmp = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? cmp : -cmp;
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });
  }

  const sortedSales = sortSales(filteredSales);

  // Helper for harvest summary
  function renderHarvestSummary(sale: SalesRecord) {
    if (!sale.harvestDate && !sale.harvestBunchCount && !sale.harvestWeight) return '—';
    const date = sale.harvestDate ? format(new Date(sale.harvestDate), 'MMM d, yyyy') : '';
    const bunches = sale.harvestBunchCount !== undefined && sale.harvestBunchCount !== null ? `${sale.harvestBunchCount} bunches` : '';
    const weight = sale.harvestWeight !== undefined && sale.harvestWeight !== null ? `${sale.harvestWeight} kg` : '';
    return [date, bunches, weight].filter(Boolean).join(' • ');
  }

  function renderConversionRate(sale: SalesRecord) {
    if (!sale.harvestRecordId) return '—';
    const rate = harvestConversionMap[sale.harvestRecordId];
    if (rate === undefined) return '—';
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={rate < 80 ? 'text-red-600 font-semibold cursor-help' : 'text-green-700 font-semibold cursor-help'}>{rate.toFixed(1)}%</span>
          </TooltipTrigger>
          <TooltipContent>
            Conversion Rate = (Sold / Harvested) × 100% for the linked harvest record.
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <>
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
                      <TableHead onClick={() => handleSort('date')} className="cursor-pointer select-none">
                        Date {getSortIcon('date')}
                      </TableHead>
                      <TableHead onClick={() => handleSort('buyerName')} className="cursor-pointer select-none">
                        Buyer {getSortIcon('buyerName')}
                      </TableHead>
                      <TableHead className="cursor-pointer select-none">
                        Farm
                      </TableHead>
                      <TableHead onClick={() => handleSort('product')} className="cursor-pointer select-none">
                        Product {getSortIcon('product')}
                      </TableHead>
                      <TableHead className="cursor-pointer select-none">
                        Harvest Summary
                      </TableHead>
                      <TableHead onClick={() => handleSort('totalAmount')} className="text-right cursor-pointer select-none">
                        Amount (KES) {getSortIcon('totalAmount')}
                      </TableHead>
                      <TableHead onClick={() => handleSort('paymentStatus')} className="cursor-pointer select-none">
                        Status {getSortIcon('paymentStatus')}
                      </TableHead>
                      <TableHead className="cursor-pointer select-none">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-flex items-center cursor-help">Conversion Rate</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              Percentage of harvested quantity that has been sold for this sale's linked harvest record.
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableHead>
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
                    ) : sortedSales.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No sales records found.
                      </TableCell>
                    </TableRow>
                  ) : (
                      sortedSales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>{format(new Date(sale.date), "MMM d, yyyy")}</TableCell>
                        <TableCell>{sale.buyerName}</TableCell>
                          <TableCell>{sale.farmName || '—'}</TableCell>
                        <TableCell>{sale.product}</TableCell>
                          <TableCell>{renderHarvestSummary(sale)}</TableCell>
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
                          <TableCell>{renderConversionRate(sale)}</TableCell>
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
                                <DropdownMenuItem onClick={() => { setSelectedSale(sale); setShowDetails(true); }}>View details</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setSelectedSale(sale); setShowEdit(true); }}>Edit record</DropdownMenuItem>
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
      {/* Modals */}
      {selectedSale && (
        <SalesDetailsModal
          sale={selectedSale}
          open={showDetails}
          onClose={() => setShowDetails(false)}
          onEdit={() => { setShowDetails(false); setShowEdit(true); }}
        />
      )}
      {selectedSale && (
        <SalesEditFormModal
          sale={selectedSale}
          open={showEdit}
          onClose={() => setShowEdit(false)}
        />
      )}
    </>
  )
}
