import { nanoid } from 'nanoid';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import 'dotenv/config';
import { products } from '@/db/schema';

function generateAppetizersId() {
	const unixTimestamp = Date.now();
	const randomSuffix = nanoid(4).toUpperCase();
	return `SALAD-${unixTimestamp}-${randomSuffix}`;
}

export const Salads = [
	{
		id: generateAppetizersId(),
		name: 'Caesar Salad',
		imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
	},
	{
		id: generateAppetizersId(),
		name: 'Greek Salad',
		imageUrl: 'https://images.pexels.com/photos/1435907/pexels-photo-1435907.jpeg',
	},
	{
		id: generateAppetizersId(),
		name: 'Cobb Salad',
		imageUrl: 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg',
	},
	{
		id: generateAppetizersId(),
		name: 'Caprese Salad',
		imageUrl: 'https://images.pexels.com/photos/1435908/pexels-photo-1435908.jpeg',
	},
	{
		id: generateAppetizersId(),
		name: 'Quinoa Salad',
		imageUrl: 'https://images.pexels.com/photos/1640776/pexels-photo-1640776.jpeg',
	},
	{
		id: generateAppetizersId(),
		name: 'Garden Salad',
		imageUrl: 'https://images.pexels.com/photos/594687/pexels-photo-594687.jpeg',
	},
	{
		id: generateAppetizersId(),
		name: 'Pasta Salad',
		imageUrl: 'https://images.pexels.com/photos/1640778/pexels-photo-1640778.jpeg',
	},
	{
		id: generateAppetizersId(),
		name: 'Tuna Salad',
		imageUrl: 'https://images.pexels.com/photos/5699517/pexels-photo-5699517.jpeg',
	},
	{
		id: generateAppetizersId(),
		name: 'Asian Sesame Salad',
		imageUrl: 'https://images.pexels.com/photos/2773606/pexels-photo-2773606.jpeg',
	},
	{
		id: generateAppetizersId(),
		name: 'Waldorf Salad',
		imageUrl: 'https://images.pexels.com/photos/1640782/pexels-photo-1640782.jpeg',
	},
];

export async function seedSalads(categoryId: string) {
	try {
		const pool = new Pool({ connectionString: process.env.DATABASE_URL });
		const db = drizzle(pool);

		// Add categoryId dynamically here
		const saladsWithCategory = Salads.map((product) => ({
			...product,
			categoryId,
		}));

		// Insert products one by one (optional)
		for (const product of saladsWithCategory) {
			await db.insert(products).values(product);
		}

		await pool.end();
	} catch (err) {
		console.error('❌ Seeding Salads failed:', err);
		process.exit(1);
	}
}