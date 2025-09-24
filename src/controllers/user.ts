import type { Request, Response } from "express";
import db from "../dbconfiguration/db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import bcrypt from 'bcrypt';

export const UserCreation = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing required user data" });
    }

    // Check if user already exists by email
    const existingUser = await db.select().from(users).where(eq(users.email, email));
    if (existingUser.length > 0) {
      return res.status(409).json({ error: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

    const newUser = await db
      .insert(users)
      .values({
        username: name,
        email: email,
        hashedPassword: hashedPassword,
      })
      .returning();

    res.status(201).json(newUser[0]);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};