import { nanoid } from 'nanoid';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import 'dotenv/config';
import { products } from '@/db/schema';

function generateAlcoholicBeverages() {
	const unixTimestamp = Date.now();
	const randomSuffix = nanoid(4).toUpperCase();
	return `ALCOHOLIC-${unixTimestamp}-${randomSuffix}`;
}

export const alcoholicBeverages = [
	{
		id: generateAlcoholicBeverages(),
		name: 'Red Wine',
		imageUrl: 'https://images.pexels.com/photos/1407855/pexels-photo-1407855.jpeg',
	},
	{
		id: generateAlcoholicBeverages(),
		name: 'White Wine',
		imageUrl: 'https://images.pexels.com/photos/247685/pexels-photo-247685.jpeg',
	},
	{
		id: generateAlcoholicBeverages(),
		name: 'Beer',
		imageUrl: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg',
	},
	{
		id: generateAlcoholicBeverages(),
		name: 'Margarita',
		imageUrl: 'https://images.pexels.com/photos/1202815/pexels-photo-1202815.jpeg',
	},
	{
		id: generateAlcoholicBeverages(),
		name: 'Mojito',
		imageUrl: 'https://images.pexels.com/photos/2763035/pexels-photo-2763035.jpeg',
	},
	{
		id: generateAlcoholicBeverages(),
		name: 'Whiskey',
		imageUrl: 'https://images.pexels.com/photos/1058277/pexels-photo-1058277.jpeg',
	},
	{
		id: generateAlcoholicBeverages(),
		name: 'Martini',
		imageUrl: 'https://images.pexels.com/photos/1343508/pexels-photo-1343508.jpeg',
	},
	{
		id: generateAlcoholicBeverages(),
		name: 'Pina Colada',
		imageUrl: 'https://images.pexels.com/photos/1571698/pexels-photo-1571698.jpeg',
	},
	{
		id: generateAlcoholicBeverages(),
		name: 'Sangria',
		imageUrl: 'https://images.pexels.com/photos/5946972/pexels-photo-5946972.jpeg',
	},
	{
		id: generateAlcoholicBeverages(),
		name: 'Gin and Tonic',
		imageUrl: 'https://images.pexels.com/photos/5946714/pexels-photo-5946714.jpeg',
	},
];


export async function seedAlcoholic(categoryId: string) {
	try {
		const pool = new Pool({ connectionString: process.env.DATABASE_URL });
		const db = drizzle(pool);

		// Add categoryId dynamically here
		const alcoholicWithCategory = alcoholicBeverages.map((product) => ({
			...product,
			categoryId,
		}));

		// Insert products one by one (optional)
		for (const product of alcoholicWithCategory) {
			await db.insert(products).values(product);
		}

		await pool.end();
	} catch (err) {
		console.error('❌ Seeding Alcoholic Beverages failed:', err);
		process.exit(1);
	}
}