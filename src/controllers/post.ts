import type { Request, Response } from "express";
import driver from "../dbconfiguration/db";

type PostProps = {
  userId: string;
  content: string;
};

export const createPost = async (req: Request, res: Response) => {
  const { userId, content } = req.body as PostProps;
  const session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (u:Person {id:$userId})
      CREATE (u)-[:WROTE]->(p:Post {
        id: randomUUID(),
        content:$content,
        createdAt:datetime()
      })
      RETURN p
      `,
      { userId, content }
    );

    if (result.records.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const postNode = result.records[0].get("p").properties;
    res.status(201).json({
      success: true,
      post: {
        id: postNode.id,
        content: postNode.content,
        createdAt: postNode.createdAt,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to create post" });
  } finally {
    await session.close();
  }
};
export const getPosts = async (req: Request, res: Response) => {
  const session = driver.session({ database: process.env.NEO4J_DATABASE });
  try {
    const result = await session.run(`
      MATCH (p:Post)<-[:WROTE]-(u:Person)
      RETURN p, u
      ORDER BY p.createdAt DESC
      LIMIT 100
    `);

    const posts = result.records.map(r => {
      const postNode = r.get("p").properties;
      const authorNode = r.get("u").properties;
      return {
        id: postNode.id,
        content: postNode.content,
        createdAt: postNode.createdAt,
        author: {
          id: authorNode.id,
          username: authorNode.username,
        },
      };
    });

    res.status(200).json({ success: true, posts });
  } catch (err) {
    console.error("Failed to fetch posts:", err);
    res.status(500).json({ success: false, error: "Failed to fetch posts" });
  } finally {
    await session.close();
  }
};
export const deletePost = async (req: Request, res: Response) => {
  const { id: postId } = req.params;
  const session = driver.session({ database: process.env.NEO4J_DATABASE });

  try {
    // First, check if the post exists
    const check = await session.run(
      `MATCH (p:Post {id: $postId}) RETURN p`,
      { postId }
    );

    if (check.records.length === 0) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    // Delete the post
    await session.run(
      `MATCH (p:Post {id: $postId}) DETACH DELETE p`,
      { postId }
    );

    res.status(200).json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to delete post" });
  } finally {
    await session.close();
  }
};