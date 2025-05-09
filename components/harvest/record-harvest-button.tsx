"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { HarvestFormModal } from "@/components/modals/harvest-form-modal"
import { Plus } from "lucide-react"

interface RecordHarvestButtonProps {
  farmId?: string
  plotId?: string
  users: { id: string; name: string }[]
  plots: { id: string; name: string }[]
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function RecordHarvestButton({
  farmId,
  plotId,
  users,
  plots,
  variant = "default",
  size = "default",
  className,
}: RecordHarvestButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <HarvestFormModal
        trigger={<Button variant="secondary">Record Harvest</Button>}
        title="Record Harvest"
        description="Record a new harvest for this farm."
        users={users.map(u => ({ id: u.id.toString(), name: u.name }))}
        plots={plots.map(p => ({ id: p.id.toString(), name: p.name }))}
        farmId={farmId?.toString() ?? ""}
      />
    </>
  )
}