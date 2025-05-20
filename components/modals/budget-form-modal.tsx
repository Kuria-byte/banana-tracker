"use client"

import { useState } from "react"
import { addBudgetRecord } from "@/app/actions/owner-dashboard-actions"
import type { BudgetFormData } from "@/lib/types/owner-dashboard"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// TODO: Replace with real data from DB
const mockPlots = [
  { id: "1", name: "Plot 1" },
  { id: "2", name: "Plot 2" },
]
const mockUsers = [
  { id: "1", name: "Alice" },
  { id: "2", name: "Bob" },
]

export function BudgetFormModal() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<BudgetFormData>({
    farmId: "1", // TODO: Replace with real farm selection
    year: new Date().getFullYear(),
    amount: 0,
    category: "",
    notes: "",
    plotId: "NONE",
    userId: "NONE",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSelect = (name: keyof BudgetFormData, value: string) => {
    setForm({ ...form, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const result = await addBudgetRecord({
        ...form,
        plotId: form.plotId === "NONE" ? null : form.plotId,
        userId: form.userId === "NONE" ? null : form.userId,
      })
      if (result.success) {
        setOpen(false)
        setForm({ ...form, amount: 0, category: "", notes: "", plotId: "NONE", userId: "NONE" })
      } else {
        setError(result.error || "Failed to add budget record")
      }
    } catch (err) {
      setError("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add Budget</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Budget</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="year">Year</Label>
            <Input
              id="year"
              name="year"
              type="number"
              value={form.year}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              value={form.amount}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="plotId">Plot</Label>
            <Select value={form.plotId || "NONE"} onValueChange={v => handleSelect("plotId", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select plot" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">None</SelectItem>
                {mockPlots.map(plot => (
                  <SelectItem key={plot.id} value={plot.id}>{plot.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="userId">User</Label>
            <Select value={form.userId || "NONE"} onValueChange={v => handleSelect("userId", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">None</SelectItem>
                {mockUsers.map(user => (
                  <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Saving..." : "Save Budget"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
} 