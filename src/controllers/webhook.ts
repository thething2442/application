import { Request, Response } from 'express';
import { Webhook } from 'svix';
import dotenv from 'dotenv'
dotenv.config();
export const clerkWebhookHandler = async (req: Request, res: Response) => {
  try {
    const payloadString = req.body.toString();

    // cast headers into the type svix expects
    const svixHeaders = {
      "svix-id": req.headers["svix-id"] as string,
      "svix-timestamp": req.headers["svix-timestamp"] as string,
      "svix-signature": req.headers["svix-signature"] as string,
    };

    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET_KEY!);
    const evt = wh.verify(payloadString, svixHeaders);

    const { id, ...attributes } = (evt as any).data;
    const eventType = (evt as any).type;

    if (eventType === 'user.created') {
      console.log(`User ${id} was ${eventType}`);
      console.log(attributes);
      // 👉 Insert into DB here
    }

    res.status(200).json({
      success: true,
      message: 'Webhook received',
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
