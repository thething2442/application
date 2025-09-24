import type { Request, Response } from "express";
import { verifyWebhook } from '@clerk/express/webhooks';
import db from '../dbconfiguration/db'; // Your database client
import * as schema from '../drizzle/schema'

export const clerkWebhookHandler = async (req: Request, res: Response) => {
  try {
    const evt = await verifyWebhook(req);
    const { id } = evt.data;
    const eventType = evt.type;
    console.log(`Received webhook with ID ${id} and event type of ${eventType}`);

    if (eventType === 'user.created') {
      const userData = evt.data;

      // Insert into your DB
      await db.insert(schema.users).values({
        clerkId: userData.id,
        email: userData.email_addresses?.[0]?.email_address || '',
        username: userData.first_name || 'Unknown',
        createdAt: Date.now(), // number
      });
      
      

      console.log(`User ${userData.id} saved to database`);
    }

    return res.send('Webhook received');
  } catch (err: any) {
    console.error('Error verifying webhook:', err);
    return res.status(400).send(`Error verifying webhook: ${err.message}`);
  }
};
