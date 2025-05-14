import { getAllHarvests } from "@/db/repositories/harvest-repository"
import { getAllFarms } from "@/db/repositories/farm-repository"
import { getAllPlots } from "@/db/repositories/plot-repository"
import YieldsClient from "@/components/yields/YieldsClient"

export default async function YieldsPage() {
  const [harvests, farms, plots] = await Promise.all([
    getAllHarvests(),
    getAllFarms(),
    getAllPlots(),
  ])

  // Compute summary stats
  const totalYield = harvests.reduce((sum, h) => sum + Number(h.totalWeight || 0), 0)
  const totalBunches = harvests.reduce((sum, h) => sum + Number(h.bunchCount || 0), 0)
  const avgQuality = harvests.length > 0 ? (harvests.reduce((sum, h) => sum + (h.qualityRating === "Good" ? 1 : h.qualityRating === "Average" ? 0.5 : 0), 0) / harvests.length) : 0

  // Prepare data for chart (monthly yield)
  const yieldByMonth = {} as Record<string, number>
  harvests.forEach(h => {
    const date = new Date(h.harvestDate)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    yieldByMonth[key] = (yieldByMonth[key] || 0) + Number(h.totalWeight || 0)
  })
  const chartData = Object.entries(yieldByMonth).map(([month, weight]) => ({ month, weight }))

  return (
    <YieldsClient
      harvests={harvests}
      farms={farms}
      plots={plots}
      totalYield={totalYield}
      totalBunches={totalBunches}
      avgQuality={avgQuality}
      chartData={chartData}
    />
  )
}