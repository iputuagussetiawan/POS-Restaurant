import { nanoid } from 'nanoid';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import 'dotenv/config';
import { products } from '@/db/schema';

function generateAppetizersId() {
	const unixTimestamp = Date.now();
	const randomSuffix = nanoid(4).toUpperCase();
	return `APPETIZER-${unixTimestamp}-${randomSuffix}`;
}

export const Appetizers = [
	{
		id: generateAppetizersId(),
		name: 'Spring Rolls',
		imageUrl: 'https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg',
	},
	{
		id: generateAppetizersId(),
		name: 'Garlic Bread',
		imageUrl: 'https://images.pexels.com/photos/3776326/pexels-photo-3776326.jpeg',
	},
	{
		id: generateAppetizersId(),
		name: 'Chicken Wings',
		imageUrl: 'https://images.pexels.com/photos/1670770/pexels-photo-1670770.jpeg',
	},
	{
		id: generateAppetizersId(),
		name: 'Mozzarella Sticks',
		imageUrl: 'https://images.pexels.com/photos/6759514/pexels-photo-6759514.jpeg',
	},
	{
		id: generateAppetizersId(),
		name: 'Nachos',
		imageUrl: 'https://images.pexels.com/photos/105588/pexels-photo-105588.jpeg',
	},
	{
		id: generateAppetizersId(),
		name: 'Fried Calamari',
		imageUrl: 'https://images.pexels.com/photos/6287764/pexels-photo-6287764.jpeg',
	},
	{
		id: generateAppetizersId(),
		name: 'Bruschetta',
		imageUrl: 'https://images.pexels.com/photos/4106484/pexels-photo-4106484.jpeg',
	},
	{
		id: generateAppetizersId(),
		name: 'Stuffed Mushrooms',
		imageUrl: 'https://images.pexels.com/photos/1002798/pexels-photo-1002798.jpeg',
	},
	{
		id: generateAppetizersId(),
		name: 'Deviled Eggs',
		imageUrl: 'https://images.pexels.com/photos/1600717/pexels-photo-1600717.jpeg',
	},
	{
		id: generateAppetizersId(),
		name: 'Meatballs',
		imageUrl: 'https://images.pexels.com/photos/6764135/pexels-photo-6764135.jpeg',
	},
];

export async function seedAppetizers(categoryId: string) {
	try {
		const pool = new Pool({ connectionString: process.env.DATABASE_URL });
		const db = drizzle(pool);

		// Add categoryId dynamically here
		const appetizersWithCategory = Appetizers.map((product) => ({
			...product,
			categoryId,
		}));

		// Insert products one by one (optional)
		for (const product of appetizersWithCategory) {
			await db.insert(products).values(product);
		}

		await pool.end();
	} catch (err) {
		console.error('❌ Seeding Appetizers failed:', err);
		process.exit(1);
	}
}