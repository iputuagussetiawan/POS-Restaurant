
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import 'dotenv/config';
import { products } from '@/db/schema';

export const Pizzas = [
	{
		id: 'Pizza-001',
		name: 'Meat Lover',
		imageUrl: 'https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg',
	},
	{
		id: 'Pizza-002',
		name: 'Margherita',
		imageUrl: 'https://images.pexels.com/photos/4109084/pexels-photo-4109084.jpeg',
	},
	{
		id: 'Pizza-003',
		name: 'Pepperoni Feast',
		imageUrl: 'https://images.pexels.com/photos/825661/pexels-photo-825661.jpeg',
	},
];

export async function seedPizza(categoryId: string) {
	try {
		const pool = new Pool({ connectionString: process.env.DATABASE_URL });
		const db = drizzle(pool);

		// Add categoryId dynamically here
		const pizzaWithCategory = Pizzas.map((product) => ({
			...product,
			categoryId,
		}));

		// Insert products one by one (optional)
		for (const product of pizzaWithCategory) {
			await db.insert(products).values(product);
		}
		await pool.end();
	} catch (err) {
		console.error('❌ Seeding Pizza failed:', err);
		process.exit(1);
	}
}