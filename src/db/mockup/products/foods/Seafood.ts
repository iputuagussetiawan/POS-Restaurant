import { nanoid } from 'nanoid';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import 'dotenv/config';
import { products } from '@/db/schema';

function generateSeafoodId() {
	const unixTimestamp = Date.now();
	const randomSuffix = nanoid(4).toUpperCase();
	return `SEAFOOD-${unixTimestamp}-${randomSuffix}`;
}

export const Seafood = [
	{
		id: generateSeafoodId(),
		name: 'Grilled Salmon',
		imageUrl: 'https://images.pexels.com/photos/3296273/pexels-photo-3296273.jpeg',
	},
	{
		id: generateSeafoodId(),
		name: 'Shrimp Scampi',
		imageUrl: 'https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg',
	},
	{
		id: generateSeafoodId(),
		name: 'Lobster Tail',
		imageUrl: 'https://images.pexels.com/photos/1618915/pexels-photo-1618915.jpeg',
	},
	{
		id: generateSeafoodId(),
		name: 'Fish Tacos',
		imageUrl: 'https://images.pexels.com/photos/128388/pexels-photo-128388.jpeg',
	},
	{
		id: generateSeafoodId(),
		name: 'Crab Cakes',
		imageUrl: 'https://images.pexels.com/photos/5067807/pexels-photo-5067807.jpeg',
	},
	{
		id: generateSeafoodId(),
		name: 'Seafood Paella',
		imageUrl: 'https://images.pexels.com/photos/5949863/pexels-photo-5949863.jpeg',
	},
	{
		id: generateSeafoodId(),
		name: 'Tuna Steak',
		imageUrl: 'https://images.pexels.com/photos/1603899/pexels-photo-1603899.jpeg',
	},
	{
		id: generateSeafoodId(),
		name: 'Garlic Butter Shrimp',
		imageUrl: 'https://images.pexels.com/photos/65175/pexels-photo-65175.jpeg',
	},
	{
		id: generateSeafoodId(),
		name: 'Sushi Platter',
		imageUrl: 'https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg',
	},
	{
		id: generateSeafoodId(),
		name: 'Clam Linguine',
		imageUrl: 'https://images.pexels.com/photos/825661/pexels-photo-825661.jpeg',
	},
];

export async function seedSeafood(categoryId: string) {
	try {
		const pool = new Pool({ connectionString: process.env.DATABASE_URL });
		const db = drizzle(pool);

		// Add categoryId dynamically here
		const seafoodWithCategory = Seafood.map((product) => ({
			...product,
			categoryId,
		}));

		// Insert products one by one (optional)
		for (const product of seafoodWithCategory) {
			await db.insert(products).values(product);
		}
		await pool.end();
	} catch (err) {
		console.error('❌ Seeding Seafood failed:', err);
		process.exit(1);
	}
}
