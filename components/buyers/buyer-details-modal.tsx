"use client"

import type { Buyer } from "@/lib/types/buyer"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, MapPin, Calendar, ClipboardList } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface BuyerDetailsModalProps {
  buyer: Buyer | null
  isOpen: boolean
  onClose: () => void
  onEdit: (buyer: Buyer) => void
}

export function BuyerDetailsModal({ buyer, isOpen, onClose, onEdit }: BuyerDetailsModalProps) {
  if (!buyer) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Buyer Details</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto pr-1">
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold">{buyer.name}</h3>
              <p className="text-muted-foreground">{buyer.company}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{buyer.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{buyer.phone}</span>
              </div>
              <div className="flex items-start">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                <span>{buyer.address}</span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-1 flex items-center">
                <ClipboardList className="h-4 w-4 mr-2" />
                Preferred Products
              </h4>
              <div className="flex flex-wrap gap-1">
                {buyer.preferredProducts.map((product) => (
                  <Badge key={product} variant="outline">
                    {product}
                  </Badge>
                ))}
              </div>
            </div>

            {buyer.notes && (
              <div>
                <h4 className="text-sm font-medium mb-1">Notes</h4>
                <p className="text-sm text-muted-foreground">{buyer.notes}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Created:</span>
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(buyer.createdAt)}
                </div>
              </div>
              {buyer.updatedAt && (
                <div>
                  <span className="text-muted-foreground">Last Updated:</span>
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(buyer.updatedAt)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => onEdit(buyer)}>Edit Buyer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
