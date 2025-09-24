import type { Request, Response } from "express";
import db from "../dbconfiguration/db";
import { posts } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const createPost = async (req: Request, res: Response) => {
  try {
    const { userId, content } = req.body;
    if (!userId || !content) {
      return res.status(400).json({ error: "Missing required fields: userId, content" });
    }
    const newPost = await db.insert(posts).values({ userId, content }).returning();
    res.status(201).json(newPost[0]);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getPosts = async (req: Request, res: Response) => {
  try {
    const allPosts = await db.select().from(posts).orderBy(desc(posts.createdAt));
    res.status(200).json(allPosts);
  } catch (error) {
    console.error("Error getting posts:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getPostById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const post = await db.select().from(posts).where(eq(posts.id, Number(id)));
    if (post.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.status(200).json(post[0]);
  } catch (error) {
    console.error("Error getting post by id:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updatePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: "Missing required field: content" });
    }
    const updatedPost = await db.update(posts).set({ content }).where(eq(posts.id, Number(id))).returning();
    if (updatedPost.length === 0) {
        return res.status(404).json({ error: "Post not found" });
    }
    res.status(200).json(updatedPost[0]);
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedPost = await db.delete(posts).where(eq(posts.id, Number(id))).returning();
    if (deletedPost.length === 0) {
        return res.status(404).json({ error: "Post not found" });
    }
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
