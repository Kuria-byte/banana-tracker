"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface HarvestScheduleModalProps {
  trigger: React.ReactNode
}

// Mock data for upcoming harvests
const upcomingHarvests = [
  {
    id: "1",
    farmName: "Main Farm",
    plotName: "Plot A",
    expectedDate: new Date(2025, 4, 15),
    estimatedYield: 120,
  },
  {
    id: "2",
    farmName: "Main Farm",
    plotName: "Plot B",
    expectedDate: new Date(2025, 4, 18),
    estimatedYield: 95,
  },
  {
    id: "3",
    farmName: "East Farm",
    plotName: "Plot C",
    expectedDate: new Date(2025, 4, 22),
    estimatedYield: 110,
  },
  {
    id: "4",
    farmName: "South Farm",
    plotName: "Plot A",
    expectedDate: new Date(2025, 5, 5),
    estimatedYield: 130,
  },
  {
    id: "5",
    farmName: "Main Farm",
    plotName: "Plot D",
    expectedDate: new Date(2025, 5, 12),
    estimatedYield: 105,
  },
]

// Helper function to format date
function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

export function HarvestScheduleModal({ trigger }: HarvestScheduleModalProps) {
  const [open, setOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  // Get harvests for the selected date
  const harvestsForSelectedDate = selectedDate
    ? upcomingHarvests.filter(
        (harvest) =>
          harvest.expectedDate.getDate() === selectedDate.getDate() &&
          harvest.expectedDate.getMonth() === selectedDate.getMonth() &&
          harvest.expectedDate.getFullYear() === selectedDate.getFullYear(),
      )
    : []

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Harvest Schedule</DialogTitle>
          <DialogDescription>View upcoming harvests for the next 30 days</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/2">
            <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} className="rounded-md border" />
          </div>

          <div className="md:w-1/2">
            <Card>
              <CardHeader>
                <CardTitle>{selectedDate ? formatDate(selectedDate) : "Select a date"}</CardTitle>
                <CardDescription>
                  {harvestsForSelectedDate.length
                    ? `${harvestsForSelectedDate.length} harvests scheduled`
                    : "No harvests scheduled for this date"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {harvestsForSelectedDate.length > 0 ? (
                  <div className="space-y-4">
                    {harvestsForSelectedDate.map((harvest) => (
                      <div key={harvest.id} className="border-b pb-3 last:border-0 last:pb-0">
                        <p className="font-medium">
                          {harvest.farmName} - {harvest.plotName}
                        </p>
                        <p className="text-sm">Estimated Yield: {harvest.estimatedYield} kg</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">No harvests scheduled for this date</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button asChild>
            <Link href="/growth/harvest">View Full Schedule</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
