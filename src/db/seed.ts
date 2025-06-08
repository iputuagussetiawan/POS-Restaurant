import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import env from "@/lib/env";
import { categories } from "./schema";

const pool = new Pool({
	connectionString: env.DATABASE_URL,
});

// TODO: logger true
export const db = drizzle(pool, { schema });
export type DB = typeof db;



const mock = [
	{
		name: "Node.js",
	},
	{
		name: "React",
	},
	{
		name: "Python",
	},
	{
		name: "Javascript",
	},
	{
		name: "Algorithms",
	},
	{
		name: "Devops",
	},
	{
		name: "APIs",
	},
];

export async function seed(db: DB) {
	await db.insert(categories).values(mock);
}
