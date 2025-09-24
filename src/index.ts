import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import driver from "./dbconfiguration/db"; // Neo4j driver
import keepNeo4jAlive from "./functions/helper";
import { createUser, loginUser } from "./controllers/user";
import { createPost ,getPosts} from "./controllers/post";
import { createComment, replyToComment, getPostComments, updateComment, deleteComment } from "./controllers/comment";
import createDummyPost from "./functions/dummy";
import helmet from "helmet";
dotenv.config();

const app = express();

// -----------------
// Middlewares
// -----------------
app.use(express.json());
app.use(
  cors({
    origin: ["https://prost-project-utility-production.netlify.app"],
  })
);

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"], // Allow your own domain
        "connect-src": ["'self'", "https://prost-project-utility-production.netlify.app"], // Allow API calls to your frontend if needed
        "script-src": ["'self'"],
        "style-src": ["'self'", "'unsafe-inline'"], // Allow inline styles if needed
        "img-src": ["'self'", "data:"],
      },
    },
  })
);
app.post("/api/users", createUser);
app.post("/api/login", loginUser);

// -----------------
// Protected Routes
// -----------------
const apiRouter = express.Router();

// Post routes
apiRouter.post("/posts", createPost);

// Comment routes
apiRouter.post("/comments", createComment);
apiRouter.post("/comments/reply", replyToComment); // reply to comment
apiRouter.get("/posts/:postId/comments", getPostComments);
apiRouter.put("/comments/:id", updateComment);
apiRouter.delete("/comments/:id", deleteComment);
apiRouter.get("/posts", getPosts);
// Webhook route
apiRouter.post("/webhooks", (req, res) => {
  console.log("Webhook received:", req.body);
  res.status(200).send("Webhook received");
});

app.use("/api", apiRouter);

// -----------------
// Neo4j Connection Test
// -----------------
const testNeo4jConnection = async () => {
  const session = driver.session();
  try {
    const result = await session.run("RETURN 1");
    console.log("✅ Neo4j connection successful:", result.records[0].get(0));
  } catch (err) {
    console.error("❌ Neo4j connection failed:", err);
    process.exit(1); // Stop server if connection fails
  } finally {
    await session.close();
  }
};

// -----------------
// Neo4j Bootstrap
// -----------------
const bootstrapNeo4j = async () => {
  const session = driver.session();
  try {
    console.log("Bootstrapping Neo4j...");

    // Create uniqueness constraints
    await session.run(`
      CREATE CONSTRAINT unique_person_id IF NOT EXISTS FOR (p:Person) REQUIRE p.id IS UNIQUE
    `);
    await session.run(`
      CREATE CONSTRAINT unique_post_id IF NOT EXISTS FOR (p:Post) REQUIRE p.id IS UNIQUE
    `);
    await session.run(`
      CREATE CONSTRAINT unique_comment_id IF NOT EXISTS FOR (c:Comment) REQUIRE c.id IS UNIQUE
    `);
    
    console.log("Neo4j constraints created.");

    // Optional: seed initial user, post, comment
    await session.run(`
      MERGE (u:Person {id: randomUUID(), username: 'Alice', email: 'alice@example.com', password: 'password', createdAt: datetime()})
      MERGE (p:Post {id: randomUUID(), content: 'Hello Neo4j!', createdAt: datetime()})
      MERGE (u)-[:WROTE]->(p)
      MERGE (c:Comment {id: randomUUID(), text: 'Welcome to Neo4j!', createdAt: datetime()})
      MERGE (u)-[:COMMENTED]->(c)
      MERGE (c)-[:ON]->(p)
      RETURN u, p, c
    `);
    console.log("Neo4j seeded with initial user, post, and comment.");
  } catch (error) {
    console.error("Neo4j bootstrap failed:", error);
  } finally {
    await session.close();
  }
};
const startServer = async () => {
  await testNeo4jConnection(); // Test Neo4j connection first
  await bootstrapNeo4j();      // Bootstrap DB
  bootstrapNeo4j().then(() => {
    keepNeo4jAlive(); // Start automatic keep-alive after bootstrapping
  });
  bootstrapNeo4j().then(() =>{
    createDummyPost()
  })
  const port = parseInt(process.env.PORT || "3000", 10);
  app.listen(port, () => {
    console.log(`Server connected on http://localhost:${port}`);
    console.log("\nRegistered API Endpoints:");
    console.log("-------------------------");
    console.log("POST   /api/users");
    console.log("POST   /api/login");
    console.log("POST   /api/posts");
    console.log("POST   /api/comments");
    console.log("POST   /api/comments/reply");
    console.log("GET    /api/posts/:postId/comments");
    console.log("PUT    /api/comments/:id");
    console.log("DELETE /api/comments/:id");
    console.log("POST   /api/webhooks");
    console.log("-------------------------");
  });
};

// Run the server
startServer();
