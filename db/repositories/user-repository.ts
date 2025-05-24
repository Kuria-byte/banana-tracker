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

export async function createUser({ stackAuthId, email, name, image, avatar, role, phone, status, salary, startDate, location, responsibilities, skills }: {
  stackAuthId: string;
  email: string;
  name: string;
  image?: string;
  avatar?: string;
  role?: "ADMIN" | "MANAGER";
  phone?: string;
  status?: string;
  salary?: number;
  startDate?: string | Date;
  location?: string;
  responsibilities?: string[];
  skills?: string[];
}): Promise<User> {
  const [created] = await db.insert(users).values({
    stackAuthId,
    email,
    name,
    image: image || null,
    avatar: avatar || null,
    role: role || "MANAGER",
    phone: phone || null,
    status: status || null,
    salary: salary ?? null,
    startDate: startDate ? new Date(startDate) : null,
    location: location ?? null,
    responsibilities: responsibilities ?? [],
    skills: skills ?? [],
    active: true,
  }).returning();
  return userDbToModel(created);
}

export async function createTeamMember({ email, name, avatar, phone, status, salary, startDate, location, responsibilities, skills }: {
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  status?: string;
  salary?: number;
  startDate?: string | Date;
  location?: string;
  responsibilities?: string[];
  skills?: string[];
}): Promise<User> {
  const [created] = await db.insert(users).values({
    stackAuthId: '',
    email,
    name,
    avatar: avatar || null,
    role: "MANAGER",
    phone: phone || null,
    status: status || null,
    salary: salary ?? null,
    startDate: startDate ? new Date(startDate) : null,
    location: location ?? null,
    responsibilities: responsibilities ?? [],
    skills: skills ?? [],
    active: true,
  }).returning();
  return userDbToModel(created);
}

function userDbToModel(dbUser: any): User {
  let startDate = "";
  if (dbUser.startDate) {
    const date = new Date(dbUser.startDate);
    startDate = isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
  }
  return {
    id: dbUser.id?.toString() ?? "",
    name: dbUser.name ?? "",
    role: dbUser.role ?? "",
    email: dbUser.email ?? "",
    phone: dbUser.phone ?? "",
    avatar: dbUser.avatar ?? "",
    status: dbUser.status ?? "",
    salary: dbUser.salary ?? 0,
    startDate,
    location: dbUser.location ?? "",
    responsibilities: Array.isArray(dbUser.responsibilities) ? dbUser.responsibilities : [],
    skills: Array.isArray(dbUser.skills) ? dbUser.skills : [],
  };
} 