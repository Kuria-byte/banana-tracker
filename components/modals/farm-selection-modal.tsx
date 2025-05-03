"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { farms } from "@/lib/mock-data"
import { Label } from "@/components/ui/label"

interface FarmSelectionModalProps {
  children: React.ReactNode
}

export function FarmSelectionModal({ children }: FarmSelectionModalProps) {
  const [open, setOpen] = useState(false)
  const [selectedFarm, setSelectedFarm] = useState<string>("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedFarm) {
      setOpen(false)
      router.push(`/farms/${selectedFarm}/health`)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Farm</DialogTitle>
          <DialogDescription>Choose a farm to score its health status</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="farm">Farm</Label>
            <Select value={selectedFarm} onValueChange={setSelectedFarm}>
              <SelectTrigger id="farm">
                <SelectValue placeholder="Select a farm" />
              </SelectTrigger>
              <SelectContent>
                {farms.map((farm) => (
                  <SelectItem key={farm.id} value={farm.id}>
                    {farm.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={!selectedFarm}>
              Continue
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
