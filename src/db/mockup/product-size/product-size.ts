import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import 'dotenv/config';
import { productItemSize } from '@/db/schema';


export const ProductSizes = [
	{
		id: 'sm-001',
		size: 'Small',
	},
	{
		id: 'md-001',
		size: 'Medium',
	},

	{
		id: 'lg-001',
		size: 'Large',
	},
];

export async function seedProductSize() {
	try {
		const pool = new Pool({ connectionString: process.env.DATABASE_URL });
		const db = drizzle(pool);

		// Insert products one by one (optional)
		console.log('📦 Inserting Product size');
		for (const ProductSize of ProductSizes) {
			await db.insert(productItemSize).values(ProductSize);
		}
		console.log('✅ Product size inserted completed');

		await pool.end();
	} catch (err) {
		console.error('❌ Seeding Product Size failed:', err);
		process.exit(1);
	}
}