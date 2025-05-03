"use client"

import { useState, useEffect } from "react"
import type { Buyer, BuyerFormData } from "@/lib/types/buyer"
import { BuyerCard } from "./buyer-card"
import { BuyerFormModal } from "../modals/buyer-form-modal"
import { BuyerDetailsModal } from "./buyer-details-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusCircle, Search } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { getBuyers, addBuyer, updateBuyer, deleteBuyer } from "@/app/actions/buyer-actions"

interface BuyerListProps {
  initialBuyers?: Buyer[]
}

export function BuyerList({ initialBuyers = [] }: BuyerListProps) {
  const [buyers, setBuyers] = useState<Buyer[]>(initialBuyers)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null)
  const [buyerToDelete, setBuyerToDelete] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(initialBuyers.length === 0)

  // Fetch buyers if not provided initially
  useEffect(() => {
    const fetchBuyers = async () => {
      if (initialBuyers.length === 0) {
        setIsLoading(true)
        try {
          const fetchedBuyers = await getBuyers()
          setBuyers(fetchedBuyers)
        } catch (error) {
          console.error("Failed to fetch buyers:", error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchBuyers()
  }, [initialBuyers])

  const filteredBuyers = buyers.filter(
    (buyer) =>
      buyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      buyer.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      buyer.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAddBuyer = () => {
    setIsAddModalOpen(true)
  }

  const handleEditBuyer = (buyer: Buyer) => {
    setSelectedBuyer(buyer)
    setIsEditModalOpen(true)
  }

  const handleViewDetails = (buyer: Buyer) => {
    setSelectedBuyer(buyer)
    setIsDetailsModalOpen(true)
  }

  const handleDeleteBuyer = (buyerId: string) => {
    setBuyerToDelete(buyerId)
    setIsDeleteDialogOpen(true)
  }

  const handleAddBuyerSubmit = async (data: BuyerFormData) => {
    try {
      const result = await addBuyer(data)
      if (result.success && result.buyer) {
        setBuyers((prev) => [...prev, result.buyer])
      }
      setIsAddModalOpen(false)
    } catch (error) {
      console.error("Failed to add buyer:", error)
    }
  }

  const handleUpdateBuyerSubmit = async (data: BuyerFormData) => {
    if (selectedBuyer) {
      try {
        const result = await updateBuyer(selectedBuyer.id, data)
        if (result.success && result.buyer) {
          setBuyers((prev) => prev.map((buyer) => (buyer.id === selectedBuyer.id ? result.buyer : buyer)))
        }
        setIsEditModalOpen(false)
      } catch (error) {
        console.error("Failed to update buyer:", error)
      }
    }
  }

  const confirmDelete = async () => {
    if (buyerToDelete) {
      try {
        const result = await deleteBuyer(buyerToDelete)
        if (result.success) {
          setBuyers((prev) => prev.filter((buyer) => buyer.id !== buyerToDelete))
        }
      } catch (error) {
        console.error("Failed to delete buyer:", error)
      } finally {
        setBuyerToDelete(null)
        setIsDeleteDialogOpen(false)
      }
    }
  }

  if (isLoading) {
    return <div className="py-10 text-center">Loading buyers...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search buyers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button onClick={handleAddBuyer}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Buyer
        </Button>
      </div>

      {filteredBuyers.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No buyers found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBuyers.map((buyer) => (
            <BuyerCard
              key={buyer.id}
              buyer={buyer}
              onEdit={handleEditBuyer}
              onDelete={handleDeleteBuyer}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      <BuyerFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddBuyerSubmit}
        title="Add New Buyer"
      />

      <BuyerFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateBuyerSubmit}
        defaultValues={selectedBuyer || undefined}
        title="Edit Buyer"
      />

      <BuyerDetailsModal
        buyer={selectedBuyer}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        onEdit={(buyer) => {
          setIsDetailsModalOpen(false)
          handleEditBuyer(buyer)
        }}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the buyer and remove their data from our
              servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
