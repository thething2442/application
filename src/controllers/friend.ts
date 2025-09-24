import type { Request, Response } from "express";
import db from "../dbconfiguration/db";
import { friends } from "../drizzle/schema";
import { eq, and, or } from "drizzle-orm";

export const addFriend = async (req: Request, res: Response) => {
    try {
        const { userId1, userId2 } = req.body;
        if (!userId1 || !userId2) {
            return res.status(400).json({ error: "Missing required fields: userId1, userId2" });
        }
        // status could be 'pending', 'accepted', 'declined'
        const status = 'pending'; 
        const newFriendRequest = await db.insert(friends).values({ userId1, userId2, status }).returning();
        res.status(201).json(newFriendRequest[0]);
    } catch (error) {
        console.error("Error adding friend:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getFriends = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const userFriends = await db.select().from(friends).where(
            and(
                eq(friends.status, 'accepted'),
                or(
                    eq(friends.userId1, Number(userId)),
                    eq(friends.userId2, Number(userId))
                )
            )
        );
        res.status(200).json(userFriends);
    } catch (error) {
        console.error("Error getting friends:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getFriendRequests = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const userFriendRequests = await db.select().from(friends).where(
            and(
                eq(friends.status, 'pending'),
                eq(friends.userId2, Number(userId))
            )
        );
        res.status(200).json(userFriendRequests);
    } catch (error) {
        console.error("Error getting friend requests:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const updateFriendStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ error: "Missing required field: status" });
        }
        const updatedFriendRequest = await db.update(friends).set({ status }).where(eq(friends.id, Number(id))).returning();
        if (updatedFriendRequest.length === 0) {
            return res.status(404).json({ error: "Friend request not found" });
        }
        res.status(200).json(updatedFriendRequest[0]);
    } catch (error) {
        console.error("Error updating friend status:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const removeFriend = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const removedFriend = await db.delete(friends).where(eq(friends.id, Number(id))).returning();
        if (removedFriend.length === 0) {
            return res.status(404).json({ error: "Friend relationship not found" });
        }
        res.status(200).json({ message: "Friend removed successfully" });
    } catch (error) {
        console.error("Error removing friend:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
