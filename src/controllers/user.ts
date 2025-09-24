import type { Request, Response } from "express";
import db from "../dbconfiguration/db";
import { users } from "../drizzle/schema";
import { Webhook, WebhookVerifyOptions } from "@clerk/clerk-sdk-node"; // Changed import
import { eq } from "drizzle-orm";

// IMPORTANT: Add your Clerk webhook secret to your .env file
const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET || ""; // Added default empty string

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

export const clerkWebhookHandler = async (req: Request, res: Response) => {
  if (!WEBHOOK_SECRET) {
    return res.status(500).json({ error: "CLERK_WEBHOOK_SECRET is not set" });
  }

  const signature = req.headers["clerk-signature"] as string; // Changed header

  try {
    // Verify webhook signature using Clerk SDK
    const event = Webhook.verifySignature({
      payload: req.body,
      signature,
      secret: WEBHOOK_SECRET,
    } as WebhookVerifyOptions);

    console.log("Clerk event received:", event.type);

    const { id, ...attributes } = event.data; // Use event.data directly
    const eventType = event.type;

    switch (eventType) {
      case "user.created":
        try {
          await db.insert(users).values({
            clerkId: id,
            email: attributes.email_addresses[0].email_address,
            username: attributes.username,
          });
          res.status(201).send("User created");
        } catch (error) {
          console.error("Error creating user from webhook:", error);
          res.status(500).send("Error creating user");
        }
        break;
      case "user.updated":
        try {
          await db
            .update(users)
            .set({
              email: attributes.email_addresses[0].email_address,
              username: attributes.username,
            })
            .where(eq(users.clerkId, id));
          res.status(200).send("User updated");
        } catch (error) {
          console.error("Error updating user from webhook:", error);
          res.status(500).send("Error updating user");
        }
        break;
      case "user.deleted":
        try {
          await db.delete(users).where(eq(users.clerkId, id));
          res.status(200).send("User deleted");
        } catch (error) {
          console.error("Error deleting user from webhook:", error);
          res.status(500).send("Error deleting user");
        }
        break;
      default:
        res.status(200).send("Event type not handled");
    }
  } catch (err) {
    console.error("Webhook verification failed:", err);
    res.status(400).send("Invalid webhook");
  }
};