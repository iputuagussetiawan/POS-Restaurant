import { nanoid } from 'nanoid';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import 'dotenv/config';
import { products } from '@/db/schema';

function generateVegetarianId() {
	const unixTimestamp = Date.now();
	const randomSuffix = nanoid(4).toUpperCase();
	return `VEGETARIAN-${unixTimestamp}-${randomSuffix}`;
}

export const Vegetarian = [
	{
		id: generateVegetarianId(),
		name: 'Tofu Stir-Fry',
		imageUrl: 'https://images.pexels.com/photos/1640779/pexels-photo-1640779.jpeg',
	},
	{
		id: generateVegetarianId(),
		name: 'Lentil Curry',
		imageUrl: 'https://images.pexels.com/photos/64208/pexels-photo-64208.jpeg',
	},
	{
		id: generateVegetarianId(),
		name: 'Veggie Burger',
		imageUrl: 'https://images.pexels.com/photos/1640771/pexels-photo-1640771.jpeg',
	},
	{
		id: generateVegetarianId(),
		name: 'Chickpea Salad',
		imageUrl: 'https://images.pexels.com/photos/7045695/pexels-photo-7045695.jpeg',
	},
	{
		id: generateVegetarianId(),
		name: 'Stuffed Bell Peppers',
		imageUrl: 'https://images.pexels.com/photos/5946884/pexels-photo-5946884.jpeg',
	},
	{
		id: generateVegetarianId(),
		name: 'Eggplant Parmesan',
		imageUrl: 'https://images.pexels.com/photos/5946688/pexels-photo-5946688.jpeg',
	},
	{
		id: generateVegetarianId(),
		name: 'Vegan Burrito',
		imageUrl: 'https://images.pexels.com/photos/3738760/pexels-photo-3738760.jpeg',
	},
	{
		id: generateVegetarianId(),
		name: 'Falafel Wrap',
		imageUrl: 'https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg',
	},
	{
		id: generateVegetarianId(),
		name: 'Zucchini Noodles',
		imageUrl: 'https://images.pexels.com/photos/5946852/pexels-photo-5946852.jpeg',
	},
	{
		id: generateVegetarianId(),
		name: 'Mushroom Risotto',
		imageUrl: 'https://images.pexels.com/photos/699953/pexels-photo-699953.jpeg',
	},
];

export async function seedVegetarian(categoryId: string) {
	try {
		const pool = new Pool({ connectionString: process.env.DATABASE_URL });
		const db = drizzle(pool);

		// Add categoryId dynamically here
		const vegeWithCategory = Vegetarian.map((product) => ({
			...product,
			categoryId,
		}));

		// Insert products one by one (optional)
		for (const product of vegeWithCategory) {
			await db.insert(products).values(product);
		}
		await pool.end();
	} catch (err) {
		console.error('❌ Seeding Vegetarian failed:', err);
		process.exit(1);
	}
}