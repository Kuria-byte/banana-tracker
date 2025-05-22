"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  MapPin,
  Calendar,
  Ruler,
  Grid,
  Leaf,
  ChevronDown,
  ChevronUp,
  Droplets,
  Clock,
  Edit,
  Banana,
  LineChart
} from "lucide-react";
import { PlotFormModal } from "@/components/modals/plot-form-modal";
import type { Plot } from "@/lib/types/plot";
import { cn } from "@/lib/utils";

interface ImprovedPlotCardProps {
  plot: Plot;
  farmId: number;
  users?: any[];
}

export function ImprovedPlotCard({ plot, farmId, users = [] }: ImprovedPlotCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Get total plant count from layout
  const totalPlants = plot.plantCount || (
    Array.isArray(plot.layoutStructure) 
      ? plot.layoutStructure.reduce((sum, row) => 
          sum + (Array.isArray(row.holes) 
            ? row.holes.filter(hole => hole.status === "PLANTED").length 
            : 0), 0) 
      : 0
  );

  // Get total hole count
  const totalHoles = Array.isArray(plot.layoutStructure)
    ? plot.layoutStructure.reduce((sum, row) => 
        sum + (Array.isArray(row.holes) ? row.holes.length : 0), 0)
    : plot.holes || 0;

  // Function to determine badge color based on status
  const getStatusColor = (status: string = "ACTIVE") => {
    if (status === "Good") 
      return "bg-green-900/30 text-green-400 border-green-700 dark:bg-green-950 dark:text-green-400 dark:border-green-800";
    if (status === "Average") 
      return "bg-yellow-900/30 text-yellow-400 border-yellow-700 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800";
    if (status === "Poor" || status === "POOR") 
      return "bg-red-900/30 text-red-400 border-red-700 dark:bg-red-950 dark:text-red-400 dark:border-red-800";
    return "bg-blue-900/30 text-blue-400 border-blue-700 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800"; // Default for ACTIVE or other statuses
  };

  // Get card border color based on health/status
  const getCardBorderColor = () => {
    if (plot.status === "Good") 
      return "border-l-4 border-l-green-600 dark:border-l-green-500";
    if (plot.status === "Average") 
      return "border-l-4 border-l-yellow-600 dark:border-l-yellow-500";
    if (plot.status === "Poor" || plot.status === "POOR") 
      return "border-l-4 border-l-red-600 dark:border-l-red-500";
    return "border-l-4 border-l-blue-600 dark:border-l-blue-500"; // Default
  };

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      getCardBorderColor(),
      "dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold dark:text-white">{plot.name}</h3>
            <div className="flex items-center text-sm text-muted-foreground dark:text-gray-400">
              <MapPin className="mr-1 h-3 w-3" />
              <span>Farm {farmId}</span>
            </div>
          </div>
          <Badge variant="outline" className={cn(getStatusColor(plot.status), "font-medium")}>
            {plot.status || "Active"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-y-3 text-sm">
          {/* First row - Area and Rows */}
          <div className="flex items-center">
            <Ruler className="mr-2 h-4 w-4 text-muted-foreground dark:text-gray-400" />
            <div>
              <p className="text-muted-foreground text-xs dark:text-gray-400">Area</p>
              <p className="font-medium dark:text-gray-200">{plot.area} acres</p>
            </div>
          </div>
          <div className="flex items-center">
            <Grid className="mr-2 h-4 w-4 text-muted-foreground dark:text-gray-400" />
            <div>
              <p className="text-muted-foreground text-xs dark:text-gray-400">Rows</p>
              <p className="font-medium dark:text-gray-200">{plot.rowCount}</p>
            </div>
          </div>

          {/* Second row - Soil Type and Established Date */}
          <div className="flex items-center">
            <Droplets className="mr-2 h-4 w-4 text-muted-foreground dark:text-gray-400" />
            <div>
              <p className="text-muted-foreground text-xs dark:text-gray-400">Soil</p>
              <p className="font-medium dark:text-gray-200">{plot.soilType || "N/A"}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4 text-muted-foreground dark:text-gray-400" />
            <div>
              <p className="text-muted-foreground text-xs dark:text-gray-400">Planted Date</p>
              <p className="font-medium dark:text-gray-200">
                {plot.createdAt 
                  ? new Date(plot.plantedDate).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Horizontal divider */}
        <div className="my-3 border-t dark:border-gray-700" />
        
        {/* Quick Stats Row */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex flex-col items-center justify-center p-1 bg-gray-50 dark:bg-gray-800 rounded">
            <Banana className="h-3 w-3 text-green-600 dark:text-green-400 mb-1" />
            <p className="font-semibold dark:text-gray-200">{totalPlants}</p>
            <p className="text-muted-foreground dark:text-gray-400">Plants</p>
          </div>
          <div className="flex flex-col items-center justify-center p-1 bg-gray-50 dark:bg-gray-800 rounded">
            <Grid className="h-3 w-3 text-blue-600 dark:text-blue-400 mb-1" />
            <p className="font-semibold dark:text-gray-200">{totalHoles}</p>
            <p className="text-muted-foreground dark:text-gray-400">Holes</p>
          </div>
          <div className="flex flex-col items-center justify-center p-1 bg-gray-50 dark:bg-gray-800 rounded">
            <LineChart className="h-3 w-3 text-purple-600 dark:text-purple-400 mb-1" />
            <p className="font-semibold dark:text-gray-200">{plot.layoutStructure ? plot.layoutStructure.length : 0}</p>
            <p className="text-muted-foreground dark:text-gray-400">Rows</p>
          </div>
        </div>

        {/* Collapsible content for additional details */}
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full mt-3">
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full flex items-center justify-center p-1 text-xs dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              {isOpen ? (
                <>Less details <ChevronUp className="ml-1 h-3 w-3" /></>
              ) : (
                <>More details <ChevronDown className="ml-1 h-3 w-3" /></>
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground text-xs dark:text-gray-400">Lease Years</p>
                <p className="font-medium dark:text-gray-200">{plot.leaseYears || "N/A"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs dark:text-gray-400">Planted Date</p>
                <p className="font-medium dark:text-gray-200">
                  {plot.plantedDate 
                    ? new Date(plot.plantedDate).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs dark:text-gray-400">Crop Type</p>
                <p className="font-medium dark:text-gray-200">{plot.cropType || "Banana"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs dark:text-gray-400">Updated</p>
                <p className="font-medium dark:text-gray-200">
                  {plot.updatedAt
                    ? new Date(plot.updatedAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* Layout visualization hint */}
            {(plot.rowCount > 0 || (plot.layoutStructure && plot.layoutStructure.length > 0)) && (
              <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs text-center">
                <p className="font-medium mb-1 dark:text-gray-200">Layout Overview</p>
                <div className="grid grid-cols-5 gap-1">
                  {[...Array(Math.min(10, plot.rowCount || (plot.layoutStructure ? plot.layoutStructure.length : 0)))].map((_, i) => (
                    <div key={i} className="h-2 bg-green-200 dark:bg-green-700 rounded" />
                  ))}
                </div>
                <p className="mt-1 text-muted-foreground dark:text-gray-400">
                  {plot.rowCount || (plot.layoutStructure ? plot.layoutStructure.length : 0)} rows with {totalHoles} holes
                </p>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>

      <CardFooter className="flex gap-2 pt-2">
        <PlotFormModal
          trigger={
            <Button 
              variant="secondary" 
              size="sm" 
              className="w-full flex items-center dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
            >
              <Edit className="mr-1 h-3 w-3" />
              Edit Plot
            </Button>
          }
          title="Edit Plot"
          description="Update plot details and layout."
          initialData={{
            id: plot.id.toString(),
            name: plot.name,
            farmId: plot.farmId.toString(),
            area: plot.area,
            soilType: plot.soilType,
            dateEstablished: plot.plantedDate ? new Date(plot.plantedDate) : new Date(),
            healthStatus: (plot.status as "Good" | "Average" | "Poor") || "Good",
            description: "",
            rowCount: plot.rowCount ?? 0,
            holeCount: Array.isArray(plot.layoutStructure)
              ? plot.layoutStructure.reduce((sum, row) => sum + (Array.isArray(row.holes) ? row.holes.length : 0), 0)
              : 0,
            plantCount: plot.plantCount ?? 0,
            layoutStructure: Array.isArray(plot.layoutStructure)
              ? plot.layoutStructure.map((row) => ({
                  length: row.length ?? 0,
                  rowNumber: row.rowNumber ?? 0,
                  spacing: row.spacing ?? 0,
                  notes: row.notes || "",
                  holes: Array.isArray(row.holes)
                    ? row.holes.map((hole) => ({
                        status: hole.status || "PLANTED",
                        rowNumber: hole.rowNumber ?? row.rowNumber ?? 0,
                        holeNumber: hole.holeNumber ?? 0,
                        plantHealth: hole.plantHealth || "Healthy",
                        mainPlantId: hole.mainPlantId,
                        activePlantIds: hole.activePlantIds ?? [],
                        targetSuckerCount: hole.targetSuckerCount ?? 3,
                        currentSuckerCount: hole.currentSuckerCount ?? 0,
                        plantedDate: hole.plantedDate || "",
                        notes: hole.notes || "",
                        suckerIds: hole.suckerIds ?? [],
                      })
                    )
                    : [],
                }))
              : [],
          }}
          farmId={plot.farmId.toString()}
        />
{/*         
        <Button 
          asChild 
          variant="outline" 
          size="sm" 
          className="w-full dark:bg-transparent dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800 dark:hover:border-gray-600"
        >
          <Link href={`/farms/${farmId}/plots/${plot.id}`}>
            Manage
          </Link>
        </Button> */}
      </CardFooter>
    </Card>
  );
}