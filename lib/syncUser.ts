import { db } from "@/db/client";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ServerUser } from "@stackframe/stack";

/**
 * Upserts a Stack Auth user into the users table.
 * @param stackUser The user object from Stack Auth (server-side)
 */
export async function syncUserWithDatabase(stackUser: ServerUser) {
  if (!stackUser?.id) throw new Error("No user ID provided");
  const now = new Date();

  // Use the literal type for role
  const role: "MANAGER" | "ADMIN" = "MANAGER";

  // Prepare user data with all required fields and sensible defaults
  const userData = {
    stackAuthId: stackUser.id,
    name: stackUser.displayName || "Unnamed User",
    email: stackUser.primaryEmail || "",
    emailVerified: stackUser.primaryEmailVerified ? now : null,
    password: null,
    image: stackUser.profileImageUrl || null,
    avatar: stackUser.profileImageUrl || null,
    status: "ACTIVE",
    salary: null,
    startDate: stackUser.signedUpAt ? new Date(stackUser.signedUpAt) : now,
    location: null,
    responsibilities: [],
    skills: [],
    role, // use the literal type
    phone: null,
    createdAt: now,
    updatedAt: now,
    active: true,
  };

  const existing = await db.select().from(users).where(eq(users.stackAuthId, stackUser.id));
  if (existing.length === 0) {
    await db.insert(users).values(userData);
  } else {
    await db.update(users)
      .set({
        ...userData,
        createdAt: existing[0].createdAt, // preserve original createdAt
        updatedAt: now,
      })
      .where(eq(users.stackAuthId, stackUser.id));
  }
} 