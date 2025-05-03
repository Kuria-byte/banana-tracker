import type { Metadata } from "next"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SalesRecordsTable } from "@/components/owner-dashboard/sales-records-table"
import { ExpenseRecordsTable } from "@/components/owner-dashboard/expense-records-table"
import { SalesFormModal } from "@/components/modals/sales-form-modal"
import { ExpenseFormModal } from "@/components/modals/expense-form-modal"
import { ReportModal } from "@/components/modals/report-modal"

export const metadata: Metadata = {
  title: "Financial Records | Banana Tracker",
  description: "View and manage all financial records for your farms",
}

export default function FinancialRecordsPage() {
  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Records</h1>
          <p className="text-muted-foreground">View and manage all your sales and expense records</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <SalesFormModal />
          <ExpenseFormModal />
          <ReportModal />
        </div>
      </div>

      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="w-full max-w-md grid grid-cols-2">
          <TabsTrigger value="sales">Sales Records</TabsTrigger>
          <TabsTrigger value="expenses">Expense Records</TabsTrigger>
        </TabsList>
        <TabsContent value="sales" className="mt-6">
          <SalesRecordsTable />
        </TabsContent>
        <TabsContent value="expenses" className="mt-6">
          <ExpenseRecordsTable />
        </TabsContent>
      </Tabs>
    </div>
  )
}
