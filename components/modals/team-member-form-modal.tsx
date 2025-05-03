"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { TeamMemberForm } from "@/components/forms/team-member-form"
import type { TeamMember } from "@/lib/types/team"
import { UserPlus } from "lucide-react"
import { addTeamMember, updateTeamMember } from "@/app/actions/team-actions"
import { toast } from "@/components/ui/use-toast"

interface TeamMemberFormModalProps {
  teamMember?: TeamMember
  buttonText?: string
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  buttonSize?: "default" | "sm" | "lg" | "icon"
  buttonIcon?: boolean
  title?: string
  description?: string
}

export function TeamMemberFormModal({
  teamMember,
  buttonText = "Add Team Member",
  buttonVariant = "default",
  buttonSize = "default",
  buttonIcon = true,
  title = "Add New Team Member",
  description = "Add a new team member to your system.",
}: TeamMemberFormModalProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      if (teamMember) {
        await updateTeamMember(teamMember.id, data)
        toast({
          title: "Team member updated",
          description: "The team member has been successfully updated.",
        })
      } else {
        await addTeamMember(data)
        toast({
          title: "Team member added",
          description: "The new team member has been successfully added.",
        })
      }
      setOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error processing your request.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (teamMember) {
    title = "Edit Team Member"
    description = "Update team member information."
    buttonText = "Edit"
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize}>
          {buttonIcon && <UserPlus className="mr-2 h-4 w-4" />}
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <TeamMemberForm teamMember={teamMember} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
