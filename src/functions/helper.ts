import driver from "../dbconfiguration/db";
const KEEP_ALIVE_INTERVAL = 9 * 60 * 1000; // 9 minutes in milliseconds
const sampleTexts = [
  "Hello world!",
  "Neo4j is awesome!",
  "Just another random post.",
  "Learning Graph Databases.",
  "Express + Neo4j is fun!",
  "Keep-alive post example.",
  "Random thoughts...",
  "This is a dummy post.",
  "Testing posts for free-tier DB.",
  "Neo4j keeps running!",
  "Exploring relationships in data.",
  "Graphs make queries faster!",
  "Automated post for testing.",
  "Backend + Database magic.",
  "Node.js + Neo4j = ❤️",
  "Free-tier testing post.",
  "Debugging is half the fun.",
  "Persistence is key.",
  "Simulating user activity.",
  "Keep your DB awake!"
];

const keepNeo4jAlive = () => {
  setInterval(async () => {
    const session = driver.session({ database: process.env.NEO4J_DATABASE });
    const content = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    try {
      // Run a lightweight query that touches the DB but does not change data
      await session.run(`
        MERGE (u:Person {username: 'KeepAliveUser'})
        CREATE (u)-[:WROTE]->(p:Post {
          id: randomUUID(),
          content: $content,
          createdAt: datetime()
        })
      `, { content });
      console.log("✅ Keep-alive query executed at", new Date().toISOString());
    } catch (err) {
      console.error("❌ Keep-alive query failed:", err);
    } finally {
      await session.close();
    }
  }, KEEP_ALIVE_INTERVAL);
};
export default keepNeo4jAlive