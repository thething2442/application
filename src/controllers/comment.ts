import type { Request, Response } from "express";
import driver from "../dbconfiguration/db";

type CommentProps = {
  userId: string;
  postId: string;
  text: string;
};

export const createComment = async (req: Request, res: Response) => {
  const { userId, postId, text } = req.body as CommentProps;
  const session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (u:Person {id:$userId}), (p:Post {id:$postId})
      CREATE (u)-[:COMMENTED]->(c:Comment {
        id: randomUUID(),
        text:$text,
        createdAt:datetime()
      })
      CREATE (c)-[:ON]->(p)
      RETURN c
      `,
      { userId, postId, text }
    );

    if (result.records.length === 0) {
      return res.status(404).json({ success: false, message: "User or Post not found" });
    }

    const commentNode = result.records[0].get("c").properties;

    res.status(201).json({
      success: true,
      comment: {
        id: commentNode.id,
        text: commentNode.text,
        createdAt: commentNode.createdAt,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to create comment" });
  } finally {
    await session.close();
  }
};
type ReplyProps = {
    userId: string;
    commentId: string; // parent comment
    text: string;
  };
  
  export const replyToComment = async (req: Request, res: Response) => {
    const { userId, commentId, text } = req.body as ReplyProps;
    const session = driver.session();
  
    try {
      const result = await session.run(
        `
        MATCH (u:Person {id:$userId}), (parent:Comment {id:$commentId})
        CREATE (u)-[:COMMENTED]->(c:Comment {
          id: randomUUID(),
          text:$text,
          createdAt:datetime()
        })
        CREATE (c)-[:REPLY_TO]->(parent)
        RETURN c
        `,
        { userId, commentId, text }
      );
  
      if (result.records.length === 0) {
        return res.status(404).json({ success: false, message: "User or Comment not found" });
      }
  
      const replyNode = result.records[0].get("c").properties;
      res.status(201).json({ success: true, reply: replyNode });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Failed to reply to comment" });
    } finally {
      await session.close();
    }
  };
  
  export const getPostComments = async (req: Request, res: Response) => {
    const { postId } = req.params;
    const session = driver.session();
  
    try {
      const result = await session.run(
        `
        MATCH (p:Post {id:$postId})
        OPTIONAL MATCH (c:Comment)-[:ON]->(p)<-[:COMMENTED]-(author:Person)
        OPTIONAL MATCH (r:Comment)-[:REPLY_TO]->(c)<-[:COMMENTED]-(replyAuthor:Person)
        RETURN c, author, collect({reply: r, replyAuthor: replyAuthor}) AS replies
        ORDER BY c.createdAt
        `,
        { postId }
      );
  
      const comments = result.records
        .filter(r => r.get("c")) // remove posts without comments
        .map(r => {
          const c = r.get("c").properties;
          const author = r.get("author")?.properties || null;
  
          const replies = (r.get("replies") || [])
            .filter((replyObj: any) => replyObj.reply) // ignore nulls
            .map((replyObj: any) => {
              const replyNode = replyObj.reply.properties;
              const replyAuthor = replyObj.replyAuthor?.properties || null;
              return {
                id: replyNode.id,
                text: replyNode.text,
                createdAt: replyNode.createdAt,
                author: replyAuthor,
              };
            });
  
          return {
            id: c.id,
            text: c.text,
            createdAt: c.createdAt,
            author,
            replies,
          };
        });
  
      res.status(200).json({ success: true, comments });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Failed to fetch comments" });
    } finally {
      await session.close();
    }
  };

export const updateComment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { text } = req.body;
  const session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (c:Comment {id: $id})
      SET c.text = $text
      RETURN c
      `,
      { id, text }
    );

    if (result.records.length === 0) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    const updatedComment = result.records[0].get("c").properties;
    res.status(200).json({ success: true, comment: updatedComment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to update comment" });
  } finally {
    await session.close();
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (c:Comment {id: $id})
      DETACH DELETE c
      `,
      { id }
    );

    if (result.summary.counters.nodesDeleted() === 0) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    res.status(200).json({ success: true, message: "Comment deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to delete comment" });
  } finally {
    await session.close();
  }
};