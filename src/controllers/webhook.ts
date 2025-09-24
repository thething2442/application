import { Request, Response } from 'express';
import { Webhook } from 'svix';
import db from '../dbconfiguration/db';
import * as schema from '../drizzle/schema';

export const clerkWebhookHandler = async (req: Request, res: Response) => {
  try {
    const payloadString = req.body.toString();

    const svixHeaders = {
      "svix-id": req.headers["svix-id"] as string,
      "svix-timestamp": req.headers["svix-timestamp"] as string,
      "svix-signature": req.headers["svix-signature"] as string,
    };

    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET_KEY!);
    const evt = wh.verify(payloadString, svixHeaders) as any;

    const eventType = evt.type;

    if (eventType === 'user.created') {
      const user = evt.data;

      await db.insert(schema.users).values({
        clerkId: user.id,
        email: user.email_addresses?.[0]?.email_address || "",
        username: user.username || user.first_name || "anonymous",
      });

      console.log(`✅ User ${user.id} saved to database`);
    }

    res.status(200).json({
      success: true,
      message: 'Webhook received',
    });
  } catch (err: any) {
    console.error("❌ Webhook error:", err.message);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
