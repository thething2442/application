import {defineConfig} from 'drizzle-kit'
import dotenv from 'dotenv'
dotenv.config();
export default defineConfig({
  dialect:'turso',
  dbCredentials:{
    url:process.env.DATABASE_URL!,
    authToken:process.env.DATABASE_TOKEN!
  },
  out:'src/drizzle',
  schema:'src/drizzle/schema.ts'
})