// import { drizzle } from 'drizzle-orm/neon-http';
import { drizzle } from 'drizzle-orm/node-postgres';
export const db = drizzle(process.env.DATABASE_LOCAL!);
