import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import driver from "../dbconfiguration/db";
import jwt from "jsonwebtoken";

type UserProps = {
  username: string;
  email: string;
  password: string;
};

const JWT_SECRET = process.env.JWT_SECRET!;

export const createUser = async (req: Request, res: Response) => {
  const { username, email, password } = req.body as UserProps;
  const session = driver.session();

  try {
    // Hash the password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await session.run(
      `
      CREATE (p:Person {
        id: randomUUID(),
        username: $username,
        email: $email,
        password: $password,
        createdAt: datetime()
      })
      RETURN p
      `,
      { username, email, password: hashedPassword }
    );

    const node = result.records[0].get("p").properties;

    res.status(201).json({
      success: true,
      user: {
        id: node.id,
        username: node.username,
        email: node.email,
        createdAt: node.createdAt,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "User creation failed" });
  } finally {
    await session.close();
  }
};

type LoginProps = {
  email: string;
  password: string;
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginProps;
  const session = driver.session();

  try {
    const result = await session.run(
      `MATCH (u:Person {email:$email}) RETURN u LIMIT 1`,
      { email }
    );

    if (result.records.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const userNode = result.records[0].get("u").properties;

    const isMatch = await bcrypt.compare(password, userNode.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: userNode.id, username: userNode.username, email: userNode.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: userNode.id,
        username: userNode.username,
        email: userNode.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Login failed" });
  } finally {
    await session.close();
  }
};
