import type { Request, Response } from "express";
import db from "../dbconfiguration/db";
import { users } from "../drizzle/schema";
import { Webhook } from "svix"; // Using svix
import { eq } from "drizzle-orm";

// IMPORTANT: Add your Clerk webhook secret to your .env file
const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET;

export const clerkWebhookHandler = async (req: Request, res: Response) => {
  if (!WEBHOOK_SECRET) {
    return res.status(500).json({ error: "CLERK_WEBHOOK_SECRET is not set" });
  }

  const headers = req.headers;
  const payload = JSON.stringify(req.body);

  const svix_id = headers["svix-id"] as string;
  const svix_timestamp = headers["svix-timestamp"] as string;
  const svix_signature = headers["svix-signature"] as string;

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).send("Error occured -- no svix headers");
  }

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: any;

  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return res.status(400).send("Error occured");
  }

  const { id, ...attributes } = evt.data;
  const eventType = evt.type;

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
};
