import { getFarmCardsData } from "@/db/repositories/farm-plot-aggregate-repository"
import FarmsClient from "./FarmsClient"

export default async function FarmsPage() {
  const farmsData = await getFarmCardsData();

  return (
    <FarmsClient farms={farmsData} />
  )
}
