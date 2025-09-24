import neo4j from "neo4j-driver";
import * as dotenv from "dotenv";
dotenv.config();

const driver = neo4j.driver(
  process.env.NEO4J_URI!,
  neo4j.auth.basic(
    process.env.NEO4J_USERNAME!,   // <- match .env
    process.env.NEO4J_PASSWORD!
  )
);

export default driver;
