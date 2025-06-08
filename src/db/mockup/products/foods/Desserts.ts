import { nanoid } from 'nanoid';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import 'dotenv/config';
import { products } from '@/db/schema';

function generateDessertsId() {
	const unixTimestamp = Date.now();
	const randomSuffix = nanoid(4).toUpperCase();
	return `DESSERT-${unixTimestamp}-${randomSuffix}`;
}

const Desserts = [
	{
		id: generateDessertsId(),
		name: 'Chocolate Cake',
		imageUrl: 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg',
	},
	{
		id: generateDessertsId(),
		name: 'Ice Cream Sundae',
		imageUrl: 'https://images.pexels.com/photos/4109994/pexels-photo-4109994.jpeg',
	},
	{
		id: generateDessertsId(),
		name: 'Tiramisu',
		imageUrl: 'https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg',
	},
	{
		id: generateDessertsId(),
		name: 'Cheesecake',
		imageUrl: 'https://images.pexels.com/photos/7045693/pexels-photo-7045693.jpeg',
	},
	{
		id: generateDessertsId(),
		name: 'Brownies',
		imageUrl: 'https://images.pexels.com/photos/108370/pexels-photo-108370.jpeg',
	},
	{
		id: generateDessertsId(),
		name: 'Fruit Tart',
		imageUrl: 'https://images.pexels.com/photos/3026809/pexels-photo-3026809.jpeg',
	},
	{
		id: generateDessertsId(),
		name: 'Crème Brûlée',
		imageUrl: 'https://images.pexels.com/photos/533325/pexels-photo-533325.jpeg',
	},
	{
		id: generateDessertsId(),
		name: 'Donuts',
		imageUrl: 'https://images.pexels.com/photos/3026806/pexels-photo-3026806.jpeg',
	},
	{
		id: generateDessertsId(),
		name: 'Macarons',
		imageUrl: 'https://images.pexels.com/photos/1571784/pexels-photo-1571784.jpeg',
	},
	{
		id: generateDessertsId(),
		name: 'Panna Cotta',
		imageUrl: 'https://images.pexels.com/photos/7045694/pexels-photo-7045694.jpeg',
	},
];

export async function seedDesserts(categoryId: string) {
	try {
		const pool = new Pool({ connectionString: process.env.DATABASE_URL });
		const db = drizzle(pool);

		// Add categoryId dynamically here
		const DessertsWithCategory = Desserts.map((product) => ({
			...product,
			categoryId,
		}));

		// Insert products one by one (optional)
		for (const product of DessertsWithCategory) {
			await db.insert(products).values(product);
		}

		await pool.end();
	} catch (err) {
		console.error('❌ Seeding Desserts failed:', err);
		process.exit(1);
	}
}