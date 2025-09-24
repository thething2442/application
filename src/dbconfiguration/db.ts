import { drizzle } from 'drizzle-orm/libsql/node';
import dotenv from 'dotenv';
dotenv.config();
const db = drizzle({ connection: {
  url: process.env.DATABASE_URL!, 
  authToken: process.env.DATABASE_TOKEN! 
}});



export default db
