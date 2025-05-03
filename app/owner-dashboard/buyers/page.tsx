import { Suspense } from "react"
import { BuyerList } from "@/components/buyers/buyer-list"
import { getBuyers } from "@/app/actions/buyer-actions"

export const metadata = {
  title: "Buyers | Banana Tracker",
  description: "Manage your buyers and track their purchase history.",
}

export default async function BuyersPage() {
  // Pre-fetch buyers for initial render
  const buyers = await getBuyers()

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Buyers Management</h1>
        <p className="text-muted-foreground">Manage your buyers and track their purchase history</p>
      </div>

      <Suspense fallback={<div className="py-10 text-center">Loading buyers...</div>}>
        <BuyerList initialBuyers={buyers} />
      </Suspense>
    </div>
  )
}
