import type { Request, Response } from "express";
import { verifyWebhook } from '@clerk/express/webhooks';

export const clerkWebhookHandler = async (req: Request, res: Response) => {
  try {
    const evt = await verifyWebhook(req);

    // Do something with payload
    // For this guide, log payload to console
    const { id } = evt.data;
    const eventType = evt.type;
    console.log(`Received webhook with ID ${id} and event type of ${eventType}`);
    console.log('Webhook payload:', evt.data);

    return res.send('Webhook received');
  } catch (err: any) { // Added : any for err
    console.error('Error verifying webhook:', err);
    return res.status(400).send(`Error verifying webhook: ${err.message}`);
  }
};