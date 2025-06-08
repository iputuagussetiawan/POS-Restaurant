import { nanoid } from 'nanoid';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import 'dotenv/config';
import { products } from '@/db/schema';

function generateKidMenuId() {
	const unixTimestamp = Date.now();
	const randomSuffix = nanoid(4).toUpperCase();
	return `KIDSMENU-${unixTimestamp}-${randomSuffix}`;
}
export const KidsMenu = [
	{
		id: generateKidMenuId() ,
		name: 'Chicken Nuggets',
		imageUrl: 'https://images.pexels.com/photos/14463289/pexels-photo-14463289.jpeg',
	},
	{
		id: generateKidMenuId() ,
		name: 'Mini Pizzas',
		imageUrl: 'https://images.pexels.com/photos/5665663/pexels-photo-5665663.jpeg',
	},
	{
		id: generateKidMenuId() ,
		name: 'Mac and Cheese',
		imageUrl: 'https://images.pexels.com/photos/14267158/pexels-photo-14267158.jpeg',
	},
	{
		id: generateKidMenuId() ,
		name: 'Hot Dogs',
		imageUrl: 'https://images.pexels.com/photos/4916555/pexels-photo-4916555.jpeg',
	},
	{
		id: generateKidMenuId() ,
		name: 'Cheese Quesadillas',
		imageUrl: 'https://images.pexels.com/photos/4113873/pexels-photo-4113873.jpeg',
	},
	{
		id: generateKidMenuId() ,
		name: 'Mini Burgers',
		imageUrl: 'https://images.pexels.com/photos/750073/pexels-photo-750073.jpeg',
	},
	{
		id: generateKidMenuId() ,
		name: 'Fish Sticks',
		imageUrl: 'https://images.pexels.com/photos/5426171/pexels-photo-5426171.jpeg',
	},
	{
		id: generateKidMenuId() ,
		name: 'Spaghetti with Tomato Sauce',
		imageUrl: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg',
	},
	{
		id: generateKidMenuId() ,
		name: 'Pancakes',
		imageUrl: 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg',
	},
	{
		id: generateKidMenuId() ,
		name: 'Juice Boxes',
		imageUrl: 'https://images.pexels.com/photos/5946785/pexels-photo-5946785.jpeg',
	},
];


export async function seedKidsMenu(categoryId: string) {
	try {
		const pool = new Pool({ connectionString: process.env.DATABASE_URL });
		const db = drizzle(pool);

		// Add categoryId dynamically here
		const appetizersWithCategory = KidsMenu.map((product) => ({
			...product,
			categoryId,
		}));

		// Insert products one by one (optional)
		for (const product of appetizersWithCategory) {
			await db.insert(products).values(product);
		}

		await pool.end();
	} catch (err) {
		console.error('❌ Seeding Kids Menu failed:', err);
		process.exit(1);
	}
}