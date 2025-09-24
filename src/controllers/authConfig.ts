import bcrypt from 'bcrypt';
import db from '../dbconfiguration/db';
import { users } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import Credentials from '@auth/express/providers/credentials';
import Google from '@auth/express/providers/google'
const authConfig = {
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials, req) => {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const [user] = await db.select().from(users).where(eq(users.email, String(credentials.email)));

        if (user && user.hashedPassword) {
          const isPasswordValid = await bcrypt.compare(String(credentials.password), user.hashedPassword);
          if (isPasswordValid) {
            return { id: String(user.id), name: user.username, email: user.email };
          }
        }
        return null;
      }
    }),
    Google
  ],
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt" as const,
  },
};
export default authConfig