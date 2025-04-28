import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, FileText, Download, Filter } from "lucide-react"

export default function ReportsPage() {
  return (
    <div className="container px-4 py-6 md:px-6 md:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Analytics and insights for your banana plantations</p>
        </div>
        <Button className="sm:w-auto">
          <Filter className="mr-2 h-4 w-4" />
          Customize Reports
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Farm Performance</CardTitle>
            <CardDescription>Compare productivity across farms</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <BarChart3 className="h-32 w-32 text-muted-foreground" />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">View Report</Button>
            <Button variant="ghost" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Harvest Yields</CardTitle>
            <CardDescription>Historical harvest data and projections</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <BarChart3 className="h-32 w-32 text-muted-foreground" />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">View Report</Button>
            <Button variant="ghost" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Input Efficiency</CardTitle>
            <CardDescription>Analyze agricultural input effectiveness</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <BarChart3 className="h-32 w-32 text-muted-foreground" />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">View Report</Button>
            <Button variant="ghost" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      <h2 className="text-xl font-semibold mt-12 mb-6">Saved Reports</h2>

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Q2 2023 Farm Performance</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardDescription>Generated on May 15, 2023</CardDescription>
          </CardHeader>
          <CardFooter className="pt-2">
            <Button variant="outline" size="sm" className="ml-auto">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Annual Yield Comparison</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardDescription>Generated on Jan 10, 2023</CardDescription>
          </CardHeader>
          <CardFooter className="pt-2">
            <Button variant="outline" size="sm" className="ml-auto">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Pest Management Effectiveness</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardDescription>Generated on Mar 22, 2023</CardDescription>
          </CardHeader>
          <CardFooter className="pt-2">
            <Button variant="outline" size="sm" className="ml-auto">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
