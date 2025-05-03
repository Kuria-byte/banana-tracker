import { db } from "../client";
import { users } from "../schema";
import type { User } from "@/lib/mock-data";

export async function getAllUsers(): Promise<User[]> {
  const result = await db.select().from(users);
  return result.map(userDbToModel);
}

function userDbToModel(dbUser: any): User {
  return {
    id: dbUser.id?.toString() ?? "",
    name: dbUser.name ?? "",
    role: dbUser.role ?? "",
    email: dbUser.email ?? "",
    phone: dbUser.phone ?? "",
    // Add other fields as needed for your UI
  };
} 