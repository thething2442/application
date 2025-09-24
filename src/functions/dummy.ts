import driver from "../dbconfiguration/db";
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

const createDummyPost = async () => {
  const session = driver.session({ database: process.env.NEO4J_DATABASE });
  try {
    const content = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    await session.run(`
      MERGE (u:Person {username: 'KeepAliveUser'})
      CREATE (u)-[:WROTE]->(p:Post {
        id: randomUUID(),
        content: $content,
        createdAt: datetime()
      })
    `, { content });
    console.log("✅ Dummy post created at", new Date().toISOString());
  } catch (err) {
    console.error("❌ Keep-alive post failed:", err);
  } finally {
    await session.close();
  }
};

// Run immediately
createDummyPost();

// Then start interval for every 9 minutes
setInterval(createDummyPost, 9 * 60 * 1000);
export default createDummyPost