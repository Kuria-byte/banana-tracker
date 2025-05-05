import { getFarmCardsData } from "@/db/repositories/farm-plot-aggregate-repository"
import FarmsClient from "./FarmsClient"
import { stackServerApp } from "@/stack";
import { redirect } from "next/navigation";
import { getAllUsers } from "@/db/repositories/user-repository"

export default async function FarmsPage() {
 // Server-side authentication check
 const user = await stackServerApp.getUser();
 if (!user) {
   redirect("/handler/sign-up"); 
 }

  const farmsData = await getFarmCardsData();
  const users = await getAllUsers();

  return (
    <FarmsClient farms={farmsData} users={users} />
  )
}
