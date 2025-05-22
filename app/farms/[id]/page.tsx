import { useParams, notFound } from "next/navigation";
import { getFarmById } from "@/db/repositories/farm-repository";
import { getPlotsByFarmId } from "@/db/repositories/plot-repository";
import { getTasksByFarmId } from "@/db/repositories/task-repository";
import { getAllUsers } from "@/db/repositories/user-repository";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  Edit,
  MapPin,
  User,
  ArrowLeft,
  Leaf,
  LayoutGrid,
  Plus,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  BarChart3,
  Calendar,
  Clock,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ArrowUpRight,
  ChevronRight,
  ListChecks,
  X,
  ExternalLink,
  Flag,
  FileText,
  Timer,
  Check,
  Info,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";
import { TaskCard } from "@/components/tasks/task-card";
import { FarmFormModal } from "@/components/modals/farm-form-modal";
import { PlotFormModal } from "@/components/modals/plot-form-modal";
import { TaskFormModal } from "@/components/modals/task-form-modal";
import { GrowthFormModal } from "@/components/modals/growth-form-modal";
import { FarmHealthScoringModal } from "@/components/modals/farm-health-scoring-modal";
import { HarvestFormModal } from "@/components/modals/harvest-form-modal";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import PlotGrowthTab from "@/components/growth/PlotGrowthTab";
import { ImprovedPlotCard } from "@/components/plots/ImprovedPlotCard";
import { getScoringRecordsByFarmId } from "@/app/actions/farm-health-actions";
import { getAllGrowthRecords } from "@/db/repositories/growth-records-repository";
import { getInspectionIssuesByFarmId } from "@/app/actions/farm-health-actions";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

// Helper to get group code from any possible property
function getGroupCode(farm: any): string {
  return (
    farm.groupCode ||
    farm.group_code ||
    farm.GroupCode ||
    farm.groupcode ||
    farm["group code"] ||
    ""
  );
}

export default async function FarmDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const farmId = Number(params.id);
  const farm = await getFarmById(farmId);
  if (!farm) notFound();

  console.log("farm object:", farm);

  const plots = await getPlotsByFarmId(farmId);
  const tasks = await getTasksByFarmId(farmId);
  const users = await getAllUsers();

  // --- Fetch health, growth, and issue stats ---
  const inspections = await getScoringRecordsByFarmId(farmId.toString());
  const growthRecords = await getAllGrowthRecords({ farmId });
  const issues = await getInspectionIssuesByFarmId(farmId.toString());

  // Health stats
  const lastInspection = inspections.data && inspections.data.length > 0 ? inspections.data[0] : null;
  const lastInspectionDate = lastInspection ? new Date(lastInspection.date).toLocaleDateString() : "N/A";
  const lastScore = lastInspection && lastInspection.totalScore != null ? lastInspection.totalScore : null;
  const lastStatus = lastInspection && lastInspection.totalScore != null ? (lastInspection.totalScore >= 70 ? "Good" : lastInspection.totalScore >= 50 ? "Average" : "Poor") : "N/A";
  const avgScore30d = inspections.data && inspections.data.length > 0 ? Math.round(
    inspections.data.filter((i: any) => new Date(i.date) > new Date(Date.now() - 30*24*60*60*1000)).reduce((sum: number, i: any) => sum + (i.totalScore || 0), 0) /
    Math.max(1, inspections.data.filter((i: any) => new Date(i.date) > new Date(Date.now() - 30*24*60*60*1000)).length)
  ) : null;
  const openHealthIssues = issues.data ? issues.data.filter((i: any) => i.status === "Open").length : 0;

  // Growth stats
  const totalPlants = plots.reduce((sum: number, plot: any) => sum + (plot.plantCount || 0), 0);
  const totalRows = plots.reduce((sum: number, plot: any) => sum + (plot.rowCount || 0), 0);
  const totalHoles = plots.reduce((sum: number, plot: any) => {
    if (!Array.isArray(plot.layoutStructure)) return sum;
    return sum + plot.layoutStructure.reduce((rowSum: number, row: any) => rowSum + (row.holes?.length || 0), 0);
  }, 0);
  
  // Get the most recent plantedDate from all holes
  let lastGrowthDate = "N/A";
  const allPlantedDates: Date[] = [];
  plots.forEach((plot: any) => {
    if (Array.isArray(plot.layoutStructure)) {
      plot.layoutStructure.forEach((row: any) => {
        row.holes?.forEach((hole: any) => {
          if (hole.plantedDate) allPlantedDates.push(new Date(hole.plantedDate));
        });
      });
    }
  });
  if (allPlantedDates.length > 0) {
    const mostRecent = new Date(Math.max(...allPlantedDates.map(d => d.getTime())));
    lastGrowthDate = mostRecent.toLocaleDateString();
  }

  // Issue stats
  const openIssues = issues.data ? issues.data.filter((i: any) => i.status === "Open").length : 0;
  const resolvedIssues = issues.data ? issues.data.filter((i: any) => i.status === "Resolved").length : 0;
  const mostCommonIssueType = (() => {
    if (!issues.data) return "N/A";
    const counts: Record<string, number> = {};
    issues.data.forEach((i: any) => { if (i.issueType) counts[i.issueType] = (counts[i.issueType] || 0) + 1 });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
  })();
  const lastIssue = issues.data && issues.data.length > 0 ? issues.data[0] : null;
  const lastIssueDate = lastIssue ? new Date(lastIssue.createdAt).toLocaleDateString() : "N/A";

  // Prepare recent/open issues for preview
  const previewIssues = issues.data ? issues.data.filter((i: any) => i.status === "Open").slice(0, 5) : [];

  // Map health status for UI
  const mapHealthStatus = (status: string) => {
    switch (status) {
      case "GOOD":
        return "Good";
      case "AVERAGE":
        return "Average";
      case "POOR":
        return "Poor";
      default:
        return status;
    }
  };

  // Ensure groupCode is always present (handles both DB and mock data)
  const normalizedFarm = {
    ...farm,
    groupCode: getGroupCode(farm),
  };
  const farmUI = {
    ...normalizedFarm,
    healthStatus: normalizedFarm.healthStatus as "Good" | "Average" | "Poor",
    plotCount: plots.length,
  };

  const getHealthStatusColor = () => {
    switch (farmUI.healthStatus) {
      case "Good":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800";
      case "Average":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
      case "Poor":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400 border-slate-200 dark:border-slate-800";
    }
  };

  const getHealthIcon = () => {
    switch (farmUI.healthStatus) {
      case "Good":
        return <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case "Average":
        return <Activity className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
      case "Poor":
        return <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />;
      default:
        return <Activity className="h-4 w-4 text-slate-600 dark:text-slate-400" />;
    }
  };

  // Find the earliest established date from plots
  const establishedDate =
    plots.length > 0
      ? plots
          .map((p) => p.plantedDate)
          .filter(Boolean)
          .sort()[0]
      : null;

  return (
    <>
      {/* Fixed Subtle Header with Breadcrumbs & Farm Info */}
      <div className="sticky top-0 left-0 right-0 z-10 bg-background/90 backdrop-blur-sm border-b">
        <div className="container flex items-center justify-between h-14 px-4 md:px-6">
          <div className="flex items-center gap-x-2">
            <Button variant="ghost" size="icon" asChild className="mr-1">
          <Link href="/farms">
                <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
            <span className="text-muted-foreground text-sm">/</span>
            <Link href="/farms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Farms
            </Link>
            <span className="text-muted-foreground text-sm">/</span>
            <span className="text-sm font-medium truncate max-w-[120px] md:max-w-none">{farmUI.name}</span>
          </div>
            <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
              <Badge
                variant="outline"
                    className={cn("font-normal flex items-center gap-1", getHealthStatusColor())}
              >
                    {getHealthIcon()}
                {farmUI.healthStatus}
              </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Farm health status</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          <FarmFormModal
            trigger={
                <Button variant="outline" size="sm" className="h-8">
                  <Edit className="h-3.5 w-3.5 mr-1" />
                  Edit
              </Button>
            }
            title="Edit Farm"
            description="Update farm details"
            initialData={{
              id: farmUI.id,
              name: farmUI.name,
              location: farmUI.location,
              healthStatus: farmUI.healthStatus,
            }}
            users={users}
          />
          </div>
        </div>
      </div>

      <div className="container px-4 pt-8 pb-16 md:px-6">
        {/* Farm Name & Hero Section */}
        <div className="relative mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">{farmUI.name}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <MapPin className="mr-1 h-4 w-4 flex-shrink-0" />
                  <span>{farmUI.location}</span>
                </div>
                <span className="hidden md:inline">•</span>
                <div className="flex items-center">
                  <Flag className="mr-1 h-4 w-4 flex-shrink-0" />
                  <span>{getGroupCode(farmUI) || "No Group Code"}</span>
                </div>
                <span className="hidden md:inline">•</span>
                {/* <div className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4 flex-shrink-0" />
                  <span>
                    Established {establishedDate ? new Date(establishedDate).toLocaleDateString() : "N/A"}
                  </span>
                </div> */}
              </div>
            </div>
            
            <div className="flex gap-2 self-end">
              <Button
                asChild
                variant="outline"
                className="gap-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/30"
              >
                <Link href={`/farms/${farmId}/health`}>
                  <Activity className="h-4 w-4" />
                  Health Dashboard
                </Link>
              </Button>
              <FarmHealthScoringModal
                farmId={farmId.toString()}
                trigger={
                  <Button className="gap-2 shadow-sm">
                    <Plus className="h-4 w-4" />
                    Record Assessment
                  </Button>
                }
          />
        </div>
      </div>

          {/* Decorative Line */}
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 mb-1">
            <div 
              className={cn(
                "absolute top-0 left-0 h-full rounded-full transition-all duration-700",
                lastStatus === "Good" ? "bg-green-500 dark:bg-green-600" : 
                lastStatus === "Average" ? "bg-yellow-500 dark:bg-yellow-600" : 
                lastStatus === "Poor" ? "bg-red-500 dark:bg-red-600" : 
                "bg-primary"
              )}
              style={{ 
                width: `${lastScore ? Math.max(5, lastScore) : 5}%`
              }}
            ></div>
          </div>
          <div className="text-xs text-muted-foreground flex justify-between">
            <span>Health Score: {lastScore ?? "N/A"}</span>
            <span>Last Assessment: {lastInspectionDate}</span>
          </div>
        </div>

        {/* Highlights/Stats Dashboard Row */}
        <div className="mb-8 overflow-hidden rounded-xl border dark:bg-black/20">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 divide-y md:divide-y-0 md:divide-x">
            {/* Stat Card 1: Farm Details */}
            <div className="p-5 relative bg-[radial-gradient(at_top_right,_hsl(var(--background))_0%,_hsl(var(--muted))_70%)]">
              <div className="flex justify-between mb-5">
                <div>
                  <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Farm Overview</h3>
                  <p className="text-2xl font-bold mt-1">{farmUI.plotCount} <span className="text-base font-normal">plots</span></p>
                </div>
                <div className="h-8 w-8 rounded-full bg-background flex items-center justify-center">
                  <FileText className="h-4 w-4 text-primary" />
        </div>
      </div>

              <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Area</p>
                  <p className="font-medium">{farm.area || "N/A"} acres</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Region</p>
                  <p className="font-medium">{farm.regionCode || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Holes</p>
                  <p className="font-medium">{totalHoles}</p>
                </div>
              <div>
                  <p className="text-xs text-muted-foreground">Plants</p>
                  <p className="font-medium">{totalPlants}</p>
                </div>
              </div>
            </div>
            
            {/* Stat Card 2: Health Assessment */}
            <div className={cn(
              "p-5 relative",
              lastStatus === "Good" ? "bg-[radial-gradient(at_top_right,_hsl(var(--background))_0%,_hsl(var(--success))_95%)]" : 
              lastStatus === "Average" ? "bg-[radial-gradient(at_top_right,_hsl(var(--background))_0%,_hsl(var(--warning))_95%)]" : 
              lastStatus === "Poor" ? "bg-[radial-gradient(at_top_right,_hsl(var(--background))_0%,_hsl(var(--warning))_95%)]" : 
              "bg-[radial-gradient(at_top_right,_hsl(var(--background))_0%,_hsl(var(--warning))_95%)]"
            )}>
              <div className="flex justify-between mb-3">
              <div>
                  <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Health Assessment</h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <p className="text-2xl font-bold">{lastScore ?? "N/A"}</p>
                    <span className={cn(
                      "px-1.5 py-0.5 text-xs font-medium rounded-full",
                      lastStatus === "Good" ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" :
                      lastStatus === "Average" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400" :
                      lastStatus === "Poor" ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400" :
                      "bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-400"
                    )}>
                      {lastStatus}
                    </span>
                  </div>
                </div>
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center",
                  lastStatus === "Good" ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" :
                  lastStatus === "Average" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400" :
                  lastStatus === "Poor" ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400" :
                  "bg-background text-primary"
                )}>
                  <Activity className="h-4 w-4" />
                </div>
              </div>
              
              <div className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">30-Day Average</span>
                  <span className="font-medium">{avgScore30d ?? "N/A"}</span>
                </div>
                <div className="w-full h-1.5 bg-background/50 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full",
                      (avgScore30d ?? 0) >= 70 ? "bg-green-500" : 
                      (avgScore30d ?? 0) >= 50 ? "bg-yellow-500" : 
                      "bg-red-500"
                    )}
                    style={{ width: `${Math.max(5, avgScore30d ?? 0)}%` }}
                  ></div>
                </div>
              </div>
              
              <FarmHealthScoringModal
                farmId={farmId.toString()}
                trigger={
                  <Button variant="outline" size="sm" className="w-full justify-between mt-3">
                    <span>New Assessment</span>
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                }
              />
            </div>
            
            {/* Stat Card 3: Active Tasks */}
            <div className="p-5 relative bg-[radial-gradient(at_top_right,_hsl(var(--background))_0%,_hsl(var(--muted))_70%)]">
              <div className="flex justify-between mb-3">
                <div>
                  <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Active Tasks</h3>
                  <div className="flex items-baseline mt-1">
                    <p className="text-2xl font-bold">
                      {tasks.filter(t => t.status === "Pending" || t.status === "In Progress").length}
                    </p>
                    <span className="text-xs text-muted-foreground ml-2">
                      of {tasks.length} total
                    </span>
                  </div>
                </div>
                <div className="h-8 w-8 rounded-full bg-background flex items-center justify-center">
                  <ListChecks className="h-4 w-4 text-primary" />
                </div>
              </div>
              
              {tasks.some(t => t.status === "Pending" || t.status === "In Progress") ? (
                <div className="mb-3 space-y-2 max-h-24 overflow-auto scrollbar-thin">
                  {tasks
                    .filter(t => t.status === "Pending" || t.status === "In Progress")
                    .slice(0, 2)
                    .map(task => (
                      <div key={task.id} className="flex justify-between items-center text-xs border-l-2 pl-2 py-1 bg-background/40 rounded-r-md border-l-blue-500">
                        <div className="truncate pr-2 font-medium">{task.title}</div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-normal whitespace-nowrap",
                            task.status === "Pending" 
                              ? "border-amber-200 bg-amber-50 text-amber-700" 
                              : "border-blue-200 bg-blue-50 text-blue-700"
                          )}
                        >
                          {task.status}
                        </Badge>
                      </div>
                    ))
                  }
                </div>
              ) : (
                <div className="text-xs text-muted-foreground mb-3">No active tasks</div>
              )}
              
              <TaskFormModal
                trigger={
                  <Button variant="outline" size="sm" className="w-full justify-between">
                    <span>Add Task</span>
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                }
                title="Add New Task"
                description="Create a new task for this farm"
                farmId={farmId.toString()}
              />
            </div>
            
            {/* Stat Card 4: Issues */}
            <div className="p-5 relative bg-[radial-gradient(at_top_right,_hsl(var(--background))_0%,_hsl(var(--muted))_70%)]">
              <div className="flex justify-between mb-3">
                <div>
                  <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Issues & Concerns</h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <p className="text-2xl font-bold">{openIssues}</p>
                    <span className={cn(
                      "px-1.5 py-0.5 text-xs font-medium rounded-full",
                      openIssues > 0 
                        ? "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400" 
                        : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                    )}>
                      {openIssues > 0 ? "Open" : "All Clear"}
                    </span>
                  </div>
                </div>
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center",
                  openIssues > 0 
                    ? "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400" 
                    : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                )}>
                  {openIssues > 0 ? (
                    <AlertTriangle className="h-4 w-4" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </div>
      </div>

              {previewIssues.length > 0 ? (
                <div className="space-y-1.5 mb-3 max-h-24 overflow-auto scrollbar-thin">
                  {previewIssues.slice(0, 2).map((issue: any) => (
                    <div 
                      key={issue.id} 
                      className="text-xs border-l-2 border-l-orange-500 pl-2 py-1 bg-background/40 rounded-r-md"
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">{issue.issueType}</span>
                        <span className="text-muted-foreground">{issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : ""}</span>
                      </div>
                      <div className="text-muted-foreground truncate">
                        {issue.description ? issue.description.slice(0, 40) + (issue.description.length > 40 ? "..." : "") : "No description"}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground mb-3">No open issues</div>
              )}
              
              {previewIssues.length > 0 ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full justify-between">
                      <span>View All Issues</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Open Issues & Concerns</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 max-h-[60vh] overflow-auto pr-2">
                      {previewIssues.map((issue: any) => (
                        <div key={issue.id} className="border-b pb-2 last:border-b-0 last:pb-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-800">
                              {issue.issueType || "Unknown"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : "N/A"}</span>
                          </div>
                          <div className="text-xs">
                            <span className="font-medium">Location:</span> Plot {issue.plotId}{issue.rowNumber ? `, Row ${issue.rowNumber}` : ""}{issue.holeNumber ? `, Hole ${issue.holeNumber}` : ""}
                          </div>
                          <div className="text-xs mt-1 text-muted-foreground">
                            {issue.description || "No description"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              ) : openIssues > 0 ? (
                <Button 
                  asChild
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-between"
                >
                  <Link href={`/farms/${farmId}/health`}>
                    <span>View Issues</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              ) : (
                <Button 
                  asChild
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-between"
                >
                  <Link href={`/farms/${farmId}/health`}>
                    <span>Health Dashboard</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="relative">
          <Tabs defaultValue="plots" className="w-full">
            <div className="border-b">
              <div className="flex overflow-x-auto scrollbar-hide">
                <TabsList className="h-auto p-0 bg-transparent">
                  <TabsTrigger 
                    value="plots" 
                    className="flex items-center gap-1.5 border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-4 py-2.5 data-[state=active]:bg-transparent"
                  >
                    <LayoutGrid className="h-4 w-4" />
                    <span>Plots</span>
          </TabsTrigger>
                  <TabsTrigger 
                    value="tasks" 
                    className="flex items-center gap-1.5 border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-4 py-2.5 data-[state=active]:bg-transparent"
                  >
                    <CalendarDays className="h-4 w-4" />
                    <span>Tasks</span>
          </TabsTrigger>
                  <TabsTrigger 
                    value="growth" 
                    className="flex items-center gap-1.5 border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-4 py-2.5 data-[state=active]:bg-transparent"
                  >
                    <Leaf className="h-4 w-4" />
                    <span>Growth</span>
          </TabsTrigger>
                  <TabsTrigger 
                    value="health" 
                    className="flex items-center gap-1.5 border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-4 py-2.5 data-[state=active]:bg-transparent"
                  >
                    <Activity className="h-4 w-4" />
                    <span>Health</span>
          </TabsTrigger>
        </TabsList>
              </div>
            </div>

            {/* Plots Tab */}
            <TabsContent value="plots" className="pt-6 focus-visible:outline-none focus-visible:ring-0">
              <div className="flex items-center justify-between mb-6">
                <div className="flex flex-col">
                  <h2 className="text-xl font-bold tracking-tight">
              Plots
            </h2>
                  {plots.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {plots.length} plot{plots.length !== 1 ? "s" : ""} in this farm
                    </p>
                  )}
                </div>

                <div className="flex gap-x-3">
              <PlotFormModal
                trigger={
                      <Button size="sm" className="h-9 shadow-sm">
                        <Plus className="h-4 w-4 mr-2" />
                        <span>Add Plot</span>
                  </Button>
                }
                title="Add New Plot"
                description="Create a new plot for this farm"
                farmId={farmId.toString()}
              />

              <HarvestFormModal
                trigger={
                      <Button size="sm" variant="outline" className="h-9">
                        <Plus className="h-4 w-4 mr-2" />
                        <span>Record Harvest</span>
                  </Button>
                }
                title="Record Harvest"
                description="Record a new harvest for this farm."
                users={users.map((u) => ({
                  id: u.id.toString(),
                  name: u.name,
                }))}
                plots={plots.map((p) => ({
                  ...p,
                  id: p.id.toString(),
                  name: p.name,
                }))}
                farmId={farmId.toString()}
              />
            </div>
          </div>

          {plots.length === 0 ? (
                <div className="text-center py-16 border rounded-lg bg-gray-50/50 dark:bg-gray-900/20">
                  <Leaf className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
                  <p className="text-muted-foreground dark:text-gray-400 mb-4">
                No plots available for this farm
              </p>
              <PlotFormModal
                    trigger={<Button>Add Your First Plot</Button>}
                title="Add New Plot"
                description="Create your first plot for this farm"
                farmId={farmId.toString()}
              />
            </div>
          ) : (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {plots.map((plot) => (
                <ImprovedPlotCard
                  key={plot.id}
                  plot={plot}
                  farmId={farmId}
                  users={users}
                />
              ))}
            </div>
          )}
        </TabsContent>

            {/* Tasks Tab */}
            <TabsContent value="tasks" className="pt-6 focus-visible:outline-none focus-visible:ring-0">
              <div className="flex justify-between items-center mb-6">
                <div className="flex flex-col">
                  <h2 className="text-xl font-bold tracking-tight">Tasks</h2>
                  {tasks.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {tasks.filter(t => t.status === "Pending" || t.status === "In Progress").length} active, {tasks.filter(t => t.status === "Completed").length} completed
                    </p>
                  )}
                </div>
            <TaskFormModal
              trigger={
                    <Button className="shadow-sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Task
                </Button>
              }
              title="Add New Task"
              description="Create a new task for this farm"
              farmId={farmId.toString()}
            />
          </div>

          {tasks.length === 0 ? (
                <div className="text-center py-16 border rounded-lg bg-gray-50/50 dark:bg-gray-900/20">
                  <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
                  <p className="text-muted-foreground mb-4">
                No tasks available for this farm
              </p>
              <TaskFormModal
                trigger={
                      <Button>Create Your First Task</Button>
                }
                title="Add New Task"
                description="Create your first task for this farm"
                farmId={farmId.toString()}
              />
            </div>
          ) : (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </TabsContent>

            {/* Growth Tab */}
            <TabsContent value="growth" className="pt-6 focus-visible:outline-none focus-visible:ring-0">
          <PlotGrowthTab
            plots={plots}
            farmId={farmId}
            farm={farm}
            farms={[farm]}
            users={users}
          />
        </TabsContent>

            {/* Health Tab */}
            <TabsContent value="health" className="pt-6 focus-visible:outline-none focus-visible:ring-0">
              <div className="flex justify-between items-center mb-6">
                <div className="flex flex-col">
                  <h2 className="text-xl font-bold tracking-tight">Farm Health Tracking</h2>
                  <p className="text-sm text-muted-foreground">
                    Monitor and improve your farm's health
                  </p>
                </div>
                <div className="flex gap-3">
                  <FarmHealthScoringModal
                    farmId={farmId.toString()}
                    trigger={<Button variant="outline">Record Assessment</Button>}
                  />
                  <Button asChild className="shadow-sm">
              <Link href={`/farms/${farmId}/health`}>
                      View Dashboard
              </Link>
            </Button>
          </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="rounded-lg border bg-card overflow-hidden">
                  <div className="border-b px-4 py-3 flex items-center justify-between bg-muted/20">
                    <h3 className="font-medium text-sm">Health Score History</h3>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="p-6 text-center">
                    <div className="h-48 w-full flex items-center justify-center">
                      <div className="text-muted-foreground text-sm px-6">
                        Health score history chart will be displayed here. 
                        Track the progress of your farm's health over time.
                      </div>
                    </div>
                  </div>
          </div>

                <div className="rounded-lg border bg-card overflow-hidden">
                  <div className="border-b px-4 py-3 flex items-center justify-between bg-muted/20">
                    <h3 className="font-medium text-sm">Recent Issues</h3>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </div>
                  {previewIssues.length > 0 ? (
                    <div className="divide-y">
                      {previewIssues.map((issue: any) => (
                        <div key={issue.id} className="p-4">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant="outline" 
                                className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800"
                              >
                                {issue.issueType || "Unknown"}
                              </Badge>
                              <span className="text-sm font-medium">Plot {issue.plotId}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : "N/A"}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {issue.description ? (
                              issue.description.length > 120 ? 
                              issue.description.slice(0, 120) + "..." : 
                              issue.description
                            ) : "No description"}
                          </p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3 mr-1" />
                            Location: {issue.rowNumber ? `Row ${issue.rowNumber}` : "N/A"} 
                            {issue.holeNumber ? `, Hole ${issue.holeNumber}` : ""}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <CheckCircle2 className="h-8 w-8 mx-auto text-green-500 mb-2" />
                      <p className="text-sm font-medium">No open issues</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        All identified issues have been resolved
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center py-8 border rounded-lg bg-gray-50/50 dark:bg-gray-900/20">
                <Activity className="h-10 w-10 mx-auto text-primary/20 mb-4" />
                <div className="max-w-md mx-auto">
                  <h3 className="text-lg font-medium mb-2">Regular Health Assessments</h3>
                  <p className="text-sm text-muted-foreground mb-6">
              Track and assess the health of your farm using our comprehensive
                    scoring system. Regular health assessments help identify issues early.
            </p>
            <FarmHealthScoringModal
              farmId={farmId.toString()}
                    trigger={<Button size="lg">Record New Health Assessment</Button>}
            />
                </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
      </div>
    </>
  );
}