import { db } from "../client";
import { users } from "../schema";
import { eq } from "drizzle-orm";
import type { User } from "@/lib/mock-data";

export async function getAllUsers(): Promise<User[]> {
  const result = await db.select().from(users);
  return result.map(userDbToModel);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await db.select().from(users).where(eq(users.email, email));
  if (result.length === 0) return null;
  return userDbToModel(result[0]);
}

export async function createUser({ stackAuthId, email, name, image, avatar, role, phone }: {
  stackAuthId: string;
  email: string;
  name: string;
  image?: string;
  avatar?: string;
  role?: string;
  phone?: string;
}): Promise<User> {
  const [created] = await db.insert(users).values({
    stackAuthId,
    email,
    name,
    image: image || null,
    avatar: avatar || null,
    role: role || "MANAGER",
    phone: phone || null,
    // Other fields can be added as needed
  }).returning();
  return userDbToModel(created);
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