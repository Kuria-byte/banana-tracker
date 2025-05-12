import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { 
  MapPin, 
  Leaf, 
  TrendingUp, 
  TrendingDown, 
  CalendarClock, 
  Grid,
  ArrowUpRight,
  ChevronRight,
  Edit,
  BarChart3,
  Activity
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useMemo } from "react"

interface FarmCardProps {
  farm: any
  holes: number
  numberOfPlots?: number
  isCompact?: boolean
  healthStatus?: string
}

export function FarmCard({ farm, holes, numberOfPlots, isCompact = false, healthStatus }: FarmCardProps) {
  // Use the prop if provided, else fallback to farm.healthStatus
  const displayHealthStatus = healthStatus || farm.healthStatus
  // Helper functions
  const getHealthStatusColor = () => {
    switch (displayHealthStatus) {
      case "Good":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800"
      case "Average":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
      case "Poor":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800"
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400 border-slate-200 dark:border-slate-800"
    }
  }

  const getHealthBorderColor = () => {
    switch (displayHealthStatus) {
      case "Good":
        return "border-l-green-500 dark:border-l-green-600"
      case "Average":
        return "border-l-yellow-500 dark:border-l-yellow-600"
      case "Poor":
        return "border-l-red-500 dark:border-l-red-600"
      default:
        return "border-l-slate-500 dark:border-l-slate-600"
    }
  }

  const getHealthIcon = () => {
    switch (displayHealthStatus) {
      case "Good":
        return <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
      case "Average":
        return <Activity className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
      case "Poor":
        return <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />
      default:
        return <Activity className="h-3 w-3 text-slate-600 dark:text-slate-400" />
    }
  }

  // Compute established date: use farm.createdAt only
  const formattedEstablishedDate = useMemo(() => {
    const dateStr = farm.createdAt;
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }, [farm.createdAt]);

  // Determine if this is a small farm
  const isSmallFarm = farm.area < 2.0

  // Determine if this is a newly established farm (less than 6 months)
  const isNewFarm = (() => {
    const dateStr = farm.createdAt;
    if (!dateStr) return false;
    const date = new Date(dateStr);
    return date > new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
  })();

  return (
    <Card className={cn(
      "h-full flex flex-col transition-all duration-200 hover:shadow-md border-l-4",
      getHealthBorderColor(),
      isCompact ? "p-2" : ""
    )}>
      <CardHeader className={cn(isCompact ? "p-3" : "")}>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center">
              {farm.name}
              {isNewFarm && (
                <Badge variant="outline" className="ml-2 text-xs bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                  New
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="mr-1 h-3 w-3" />
              {farm.location}
            </div>
          </div>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className={cn("font-normal flex items-center gap-1", getHealthStatusColor())}>
                  {getHealthIcon()}
                  {displayHealthStatus}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Farm health: {displayHealthStatus}</p>
                <p className="text-xs">Based on recent assessments</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      
      <CardContent className={cn("flex-1", isCompact ? "px-3 pb-2" : "")}>
        <div className="grid grid-cols-2 gap-y-3 text-sm">
          <div className="flex items-center">
            <Leaf className="mr-2 h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground text-xs">Area</p>
              <p className="font-medium">{farm.area} acres</p>
            </div>
          </div>
          <div className="flex items-center">
            <Grid className="mr-2 h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground text-xs">Plots</p>
              <p className="font-medium flex items-center">
                {typeof numberOfPlots === 'number' ? numberOfPlots : (farm.plotCount || 0)}
                {isSmallFarm && (
                  <span className="ml-1 text-xs text-muted-foreground">(Small)</span>
                )}
              </p>
            </div>
          </div>
          
          {!isCompact && (
            <>
              <div className="flex items-center">
                <Grid className="mr-2 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground text-xs">Holes</p>
                  <p className="font-medium">{holes}</p>
                </div>
              </div>
              {/* <div className="flex items-center">
                <CalendarClock className="mr-2 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground text-xs">Established</p>
                  <p className="font-medium">{formattedEstablishedDate}</p>
                </div>
              </div> */}
            </>
          )}
        </div>

        {!isCompact && (
          <div className="mt-4 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full",
                displayHealthStatus === "Good" ? "bg-green-500 dark:bg-green-600" :
                displayHealthStatus === "Average" ? "bg-yellow-500 dark:bg-yellow-600" :
                "bg-red-500 dark:bg-red-600"
              )} 
              style={{ width: displayHealthStatus === "Good" ? "85%" : displayHealthStatus === "Average" ? "50%" : displayHealthStatus === "Poor" ? "25%" : "10%" }}
            ></div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className={cn(isCompact ? "px-3 pt-0 pb-3" : "")}>
        <div className="w-full flex gap-2">
          <Button asChild variant="default" size={isCompact ? "sm" : "default"} className="flex-1">
            <Link href={`/farms/${farm.id}`}>
              {isCompact ? (
                <>Details<ChevronRight className="ml-1 h-4 w-4" /></>
              ) : (
                <>View Details<ArrowUpRight className="ml-2 h-4 w-4" /></>
              )}
            </Link>
          </Button>
          
          {!isCompact && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  {/* <Button variant="outline" size="icon">
                    <BarChart3 className="h-4 w-4" />
                  </Button> */}
                </TooltipTrigger>
                {/* <TooltipContent>
                  <p>View Health Charts</p>
                </TooltipContent> */}
              </Tooltip>
            </TooltipProvider>
          )}
          
          {!isCompact && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  {/* <Button variant="outline" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button> */}
                </TooltipTrigger>
                {/* <TooltipContent>
                  <p>Edit Farm</p>
                </TooltipContent> */}
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}