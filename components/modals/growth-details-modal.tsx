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

interface GrowthDetailsModalProps {
  trigger: React.ReactNode
}

export function GrowthDetailsModal({ trigger }: GrowthDetailsModalProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Plants in Growth</DialogTitle>
          <DialogDescription>Detailed view of plants at different growth stages</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="flower">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="flower">Flower Emergence</TabsTrigger>
            <TabsTrigger value="bunch">Bunch Formation</TabsTrigger>
            <TabsTrigger value="fruit">Fruit Development</TabsTrigger>
          </TabsList>

          <TabsContent value="flower">
            <Card>
              <CardHeader>
                <CardTitle>Flower Emergence Stage</CardTitle>
                <CardDescription>Plants in the flower emergence stage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Plants</p>
                      <p className="text-2xl font-bold">24</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Average Age</p>
                      <p className="text-2xl font-bold">2 weeks</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Health Distribution</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Healthy</span>
                        <span className="text-sm font-medium">80%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="bg-green-500 h-full rounded-full" style={{ width: "80%" }}></div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">Diseased</span>
                        <span className="text-sm font-medium">10%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="bg-yellow-500 h-full rounded-full" style={{ width: "10%" }}></div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">Pest-affected</span>
                        <span className="text-sm font-medium">7%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="bg-orange-500 h-full rounded-full" style={{ width: "7%" }}></div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">Damaged</span>
                        <span className="text-sm font-medium">3%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="bg-red-500 h-full rounded-full" style={{ width: "3%" }}></div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Farm Distribution</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Main Farm</span>
                        <span className="text-sm font-medium">12</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">East Farm</span>
                        <span className="text-sm font-medium">8</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">South Farm</span>
                        <span className="text-sm font-medium">4</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bunch">
            <Card>
              <CardHeader>
                <CardTitle>Bunch Formation Stage</CardTitle>
                <CardDescription>Plants in the bunch formation stage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Plants</p>
                      <p className="text-2xl font-bold">38</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Average Age</p>
                      <p className="text-2xl font-bold">6 weeks</p>
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
                        <span className="text-sm font-medium">15%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="bg-yellow-500 h-full rounded-full" style={{ width: "15%" }}></div>
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
                        <span className="text-sm font-medium">2%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="bg-red-500 h-full rounded-full" style={{ width: "2%" }}></div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Farm Distribution</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Main Farm</span>
                        <span className="text-sm font-medium">20</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">East Farm</span>
                        <span className="text-sm font-medium">10</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">South Farm</span>
                        <span className="text-sm font-medium">8</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fruit">
            <Card>
              <CardHeader>
                <CardTitle>Fruit Development Stage</CardTitle>
                <CardDescription>Plants in the fruit development stage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Plants</p>
                      <p className="text-2xl font-bold">28</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Average Age</p>
                      <p className="text-2xl font-bold">10 weeks</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Health Distribution</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Healthy</span>
                        <span className="text-sm font-medium">70%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="bg-green-500 h-full rounded-full" style={{ width: "70%" }}></div>
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
                        <span className="text-sm font-medium">10%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="bg-orange-500 h-full rounded-full" style={{ width: "10%" }}></div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">Damaged</span>
                        <span className="text-sm font-medium">8%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="bg-red-500 h-full rounded-full" style={{ width: "8%" }}></div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Farm Distribution</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Main Farm</span>
                        <span className="text-sm font-medium">15</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">East Farm</span>
                        <span className="text-sm font-medium">8</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">South Farm</span>
                        <span className="text-sm font-medium">5</span>
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
