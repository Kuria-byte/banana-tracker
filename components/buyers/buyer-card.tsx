"use client"

import type { Buyer } from "@/lib/types/buyer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building, Mail, Phone, MapPin, Edit, Trash } from "lucide-react"

interface BuyerCardProps {
  buyer: Buyer
  onEdit: (buyer: Buyer) => void
  onDelete: (buyerId: string) => void
  onViewDetails: (buyer: Buyer) => void
}

export function BuyerCard({ buyer, onEdit, onDelete, onViewDetails }: BuyerCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{buyer.name}</CardTitle>
          <div className="flex space-x-1">
            <Button variant="ghost" size="icon" onClick={() => onEdit(buyer)} className="h-8 w-8">
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(buyer.id)} className="h-8 w-8 text-destructive">
              <Trash className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <Building className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{buyer.company}</span>
          </div>
          <div className="flex items-center text-sm">
            <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{buyer.email}</span>
          </div>
          <div className="flex items-center text-sm">
            <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{buyer.phone}</span>
          </div>
          <div className="flex items-start text-sm">
            <MapPin className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
            <span className="line-clamp-2">{buyer.address}</span>
          </div>
          <div className="pt-2">
            <div className="text-sm font-medium mb-1">Preferred Products:</div>
            <div className="flex flex-wrap gap-1">
              {buyer.preferredProducts.map((product) => (
                <Badge key={product} variant="outline">
                  {product}
                </Badge>
              ))}
            </div>
          </div>
          <Button variant="outline" className="w-full mt-2" onClick={() => onViewDetails(buyer)}>
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
