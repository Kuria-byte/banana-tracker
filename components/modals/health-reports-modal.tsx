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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface HealthReportsModalProps {
  trigger: React.ReactNode
}

export function HealthReportsModal({ trigger }: HealthReportsModalProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Health Reports</DialogTitle>
          <DialogDescription>Detailed health status of your banana plants</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="diseased">Diseased</TabsTrigger>
            <TabsTrigger value="pests">Pest-affected</TabsTrigger>
            <TabsTrigger value="damaged">Damaged</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Health Overview</CardTitle>
                <CardDescription>Summary of plant health across all farms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Plants</p>
                      <p className="text-2xl font-bold">120</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Healthy Plants</p>
                      <p className="text-2xl font-bold">90 (75%)</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Health Distribution</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Healthy</span>
                        <span className="text-sm font-medium">75%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="bg-green-500 h-full rounded-full" style={{ width: "75%" }}></div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">Diseased</span>
                        <span className="text-sm font-medium">12%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="bg-yellow-500 h-full rounded-full" style={{ width: "12%" }}></div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">Pest-affected</span>
                        <span className="text-sm font-medium">8%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="bg-orange-500 h-full rounded-full" style={{ width: "8%" }}></div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">Damaged</span>
                        <span className="text-sm font-medium">5%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="bg-red-500 h-full rounded-full" style={{ width: "5%" }}></div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Health by Farm</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Main Farm</span>
                        <span className="text-sm font-medium">80% Healthy</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">East Farm</span>
                        <span className="text-sm font-medium">70% Healthy</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">South Farm</span>
                        <span className="text-sm font-medium">65% Healthy</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="diseased">
            <Card>
              <CardHeader>
                <CardTitle>Diseased Plants</CardTitle>
                <CardDescription>Plants affected by diseases</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Diseased</p>
                      <p className="text-2xl font-bold">14</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Percentage</p>
                      <p className="text-2xl font-bold">12%</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Common Diseases</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Panama Disease</span>
                        <span className="text-sm font-medium">5 plants</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Black Sigatoka</span>
                        <span className="text-sm font-medium">4 plants</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Banana Bunchy Top</span>
                        <span className="text-sm font-medium">3 plants</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Other</span>
                        <span className="text-sm font-medium">2 plants</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Affected Farms</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Main Farm</span>
                        <span className="text-sm font-medium">6 plants</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">East Farm</span>
                        <span className="text-sm font-medium">5 plants</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">South Farm</span>
                        <span className="text-sm font-medium">3 plants</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pests">
            <Card>
              <CardHeader>
                <CardTitle>Pest-affected Plants</CardTitle>
                <CardDescription>Plants affected by pests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Pest-affected</p>
                      <p className="text-2xl font-bold">10</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Percentage</p>
                      <p className="text-2xl font-bold">8%</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Common Pests</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Banana Weevil</span>
                        <span className="text-sm font-medium">4 plants</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Nematodes</span>
                        <span className="text-sm font-medium">3 plants</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Thrips</span>
                        <span className="text-sm font-medium">2 plants</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Other</span>
                        <span className="text-sm font-medium">1 plant</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Affected Farms</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Main Farm</span>
                        <span className="text-sm font-medium">4 plants</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">East Farm</span>
                        <span className="text-sm font-medium">3 plants</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">South Farm</span>
                        <span className="text-sm font-medium">3 plants</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="damaged">
            <Card>
              <CardHeader>
                <CardTitle>Damaged Plants</CardTitle>
                <CardDescription>Plants damaged by weather or other factors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Damaged</p>
                      <p className="text-2xl font-bold">6</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Percentage</p>
                      <p className="text-2xl font-bold">5%</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Damage Types</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Wind Damage</span>
                        <span className="text-sm font-medium">3 plants</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Mechanical Damage</span>
                        <span className="text-sm font-medium">2 plants</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Other</span>
                        <span className="text-sm font-medium">1 plant</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Affected Farms</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Main Farm</span>
                        <span className="text-sm font-medium">2 plants</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">East Farm</span>
                        <span className="text-sm font-medium">2 plants</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">South Farm</span>
                        <span className="text-sm font-medium">2 plants</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
