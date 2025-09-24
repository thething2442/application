import type { Request, Response } from "express";
import db from "../dbconfiguration/db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export const UserCreation = async (req: Request, res: Response) => {
  try {
    const { username, email, clerkId } = req.body;

    if (!username || !email || !clerkId) {
      return res.status(400).json({ error: "Missing required fields: username, email, clerkId" });
    }

    // Check if user already exists by clerkId
    const existingUser = await db.select().from(users).where(eq(users.clerkId, clerkId));
    if (existingUser.length > 0) {
      return res.status(409).json({ error: "User with this clerkId already exists" });
    }

    const newUser = await db
      .insert(users)
      .values({
        username,
        email,
        clerkId,
      })
      .returning();

    res.status(201).json(newUser[0]);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};