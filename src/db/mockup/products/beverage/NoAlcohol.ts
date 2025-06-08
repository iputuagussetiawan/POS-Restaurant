import { nanoid } from 'nanoid';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import 'dotenv/config';
import { products } from '@/db/schema';

function generateNonAlcoholicBeverages() {
	const unixTimestamp = Date.now();
	const randomSuffix = nanoid(4).toUpperCase();
	return `NONALCOHOLIC-${unixTimestamp}-${randomSuffix}`;
}

export const NonAlcoholic = [
	{
		id: generateNonAlcoholicBeverages(),
		name: 'Iced Coffee',
		imageUrl: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg',
	},
	{
		id: generateNonAlcoholicBeverages(),
		name: 'Green Tea',
		imageUrl: 'https://images.pexels.com/photos/1417945/pexels-photo-1417945.jpeg',
	},
	{
		id: generateNonAlcoholicBeverages(),
		name: 'Lemonade',
		imageUrl: 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg',
	},
	{
		id: generateNonAlcoholicBeverages(),
		name: 'Smoothie',
		imageUrl: 'https://images.pexels.com/photos/414555/pexels-photo-414555.jpeg',
	},
	{
		id: generateNonAlcoholicBeverages(),
		name: 'Milkshake',
		imageUrl: 'https://images.pexels.com/photos/1126728/pexels-photo-1126728.jpeg',
	},
	{
		id: generateNonAlcoholicBeverages(),
		name: 'Iced Tea',
		imageUrl: 'https://images.pexels.com/photos/594697/pexels-photo-594697.jpeg',
	},
	{
		id: generateNonAlcoholicBeverages(),
		name: 'Sparkling Water',
		imageUrl: 'https://images.pexels.com/photos/1437263/pexels-photo-1437263.jpeg',
	},
	{
		id: generateNonAlcoholicBeverages(),
		name: 'Hot Chocolate',
		imageUrl: 'https://images.pexels.com/photos/3028994/pexels-photo-3028994.jpeg',
	},
	{
		id: generateNonAlcoholicBeverages(),
		name: 'Fruit Juice',
		imageUrl: 'https://images.pexels.com/photos/594693/pexels-photo-594693.jpeg',
	},
	{
		id: generateNonAlcoholicBeverages(),
		name: 'Coconut Water',
		imageUrl: 'https://images.pexels.com/photos/1459338/pexels-photo-1459338.jpeg',
	},
];

export async function seedNonAlcoholic(categoryId: string) {
	try {
		const pool = new Pool({ connectionString: process.env.DATABASE_URL });
		const db = drizzle(pool);

		// Add categoryId dynamically here
		const nonAlcoholicWithCategory = NonAlcoholic.map((product) => ({
			...product,
			categoryId,
		}));

		// Insert products one by one (optional)
		for (const product of nonAlcoholicWithCategory) {
			await db.insert(products).values(product);
		}

		await pool.end();
	} catch (err) {
		console.error('❌ Seeding Non-Alcoholic Beverages failed:', err);
		process.exit(1);
	}
}