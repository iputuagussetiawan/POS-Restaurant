import { nanoid } from 'nanoid';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import 'dotenv/config';
import { productItem, products } from '@/db/schema';

function generateSaladId() {
	const unixTimestamp = Date.now();
	const randomSuffix = nanoid(4).toUpperCase();
	return `SALAD-${unixTimestamp}-${randomSuffix}`;
}

function generateSaladItemId() {
	const unixTimestamp = Date.now();
	const randomSuffix = nanoid(4).toUpperCase();
	return `SALAD-ITM-${unixTimestamp}-${randomSuffix}`;
}

const saladDefinitions = [
	{
		name: 'Caesar Salad',
		imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
		price: 25000,
	},
	{
		name: 'Greek Salad',
		imageUrl: 'https://images.pexels.com/photos/1435907/pexels-photo-1435907.jpeg',
		price: 24000,
	},
	{
		name: 'Cobb Salad',
		imageUrl: 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg',
		price: 27000,
	},
	{
		name: 'Caprese Salad',
		imageUrl: 'https://images.pexels.com/photos/1435908/pexels-photo-1435908.jpeg',
		price: 26000,
	},
	{
		name: 'Quinoa Salad',
		imageUrl: 'https://images.pexels.com/photos/1640776/pexels-photo-1640776.jpeg',
		price: 28000,
	},
	{
		name: 'Garden Salad',
		imageUrl: 'https://images.pexels.com/photos/594687/pexels-photo-594687.jpeg',
		price: 22000,
	},
	{
		name: 'Pasta Salad',
		imageUrl: 'https://images.pexels.com/photos/1640778/pexels-photo-1640778.jpeg',
		price: 23000,
	},
	{
		name: 'Tuna Salad',
		imageUrl: 'https://images.pexels.com/photos/5699517/pexels-photo-5699517.jpeg',
		price: 29000,
	},
	{
		name: 'Asian Sesame Salad',
		imageUrl: 'https://images.pexels.com/photos/2773606/pexels-photo-2773606.jpeg',
		price: 27000,
	},
	{
		name: 'Waldorf Salad',
		imageUrl: 'https://images.pexels.com/photos/1640782/pexels-photo-1640782.jpeg',
		price: 26000,
	},
];

export const Salads = saladDefinitions.map((salad) => {
	const id = generateSaladId();
	return {
		id,
		name: salad.name,
		imageUrl: salad.imageUrl,
		items: [
			{
				id: generateSaladItemId(),
				productId: id,
				productItemSizeId: 'md-001',
				price: salad.price,
			},
		],
	};
});

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
			for (const ProductItemData of product.items) {
				await db.insert(productItem).values(ProductItemData);
			}
		}

		await pool.end();
	} catch (err) {
		console.error('❌ Seeding Salads failed:', err);
		process.exit(1);
	}
}
