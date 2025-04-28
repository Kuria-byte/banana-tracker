import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { type Farm, formatDate } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { MapPin } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface FarmCardProps {
  farm: Farm
}

export function FarmCard({ farm }: FarmCardProps) {
  const getHealthStatusColor = () => {
    switch (farm.healthStatus) {
      case "Good":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "Average":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "Poor":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return ""
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{farm.name}</CardTitle>
          <Badge variant="outline" className={`${getHealthStatusColor()} font-normal`}>
            {farm.healthStatus}
          </Badge>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="mr-1 h-3 w-3" />
          {farm.location}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground">Area</p>
            <p className="font-medium">{farm.area} acres</p>
          </div>
          <div>
            <p className="text-muted-foreground">Plots</p>
            <p className="font-medium">{farm.plotCount}</p>
          </div>
          <div className="col-span-2">
            <p className="text-muted-foreground">Established</p>
            <p className="font-medium">{formatDate(farm.dateEstablished)}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/farms/${farm.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
