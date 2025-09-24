import type { Request, Response } from "express";
import db from "../dbconfiguration/db";
import { comments } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const createComment = async (req: Request, res: Response) => {
    try {
        const { userId, postId, content } = req.body;
        if (!userId || !postId || !content) {
            return res.status(400).json({ error: "Missing required fields: userId, postId, content" });
        }
        const newComment = await db.insert(comments).values({ userId, postId, content }).returning();
        res.status(201).json(newComment[0]);
    } catch (error) {
        console.error("Error creating comment:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getCommentsForPost = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;
        const postComments = await db.select().from(comments).where(eq(comments.postId, Number(postId))).orderBy(desc(comments.createdAt));
        res.status(200).json(postComments);
    } catch (error) {
        console.error("Error getting comments for post:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const updateComment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ error: "Missing required field: content" });
        }
        const updatedComment = await db.update(comments).set({ content }).where(eq(comments.id, Number(id))).returning();
        if (updatedComment.length === 0) {
            return res.status(404).json({ error: "Comment not found" });
        }
        res.status(200).json(updatedComment[0]);
    } catch (error) {
        console.error("Error updating comment:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const deleteComment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deletedComment = await db.delete(comments).where(eq(comments.id, Number(id))).returning();
        if (deletedComment.length === 0) {
            return res.status(404).json({ error: "Comment not found" });
        }
        res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
        console.error("Error deleting comment:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
