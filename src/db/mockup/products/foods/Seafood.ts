import { nanoid } from 'nanoid';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import 'dotenv/config';
import { productItem, products } from '@/db/schema';

function generateSeafoodId() {
	const unixTimestamp = Date.now();
	const randomSuffix = nanoid(4).toUpperCase();
	return `SEAFOOD-${unixTimestamp}-${randomSuffix}`;
}

function generateSeafoodItemId() {
	const unixTimestamp = Date.now();
	const randomSuffix = nanoid(4).toUpperCase();
	return `SEAFOOD-ITM-${unixTimestamp}-${randomSuffix}`;
}

const seafoodDefinitions = [
	{
		name: 'Grilled Salmon',
		imageUrl: 'https://images.pexels.com/photos/3296273/pexels-photo-3296273.jpeg',
		price: 52000,
	},
	{
		name: 'Shrimp Scampi',
		imageUrl: 'https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg',
		price: 48000,
	},
	{
		name: 'Lobster Tail',
		imageUrl: 'https://images.pexels.com/photos/1618915/pexels-photo-1618915.jpeg',
		price: 85000,
	},
	{
		name: 'Fish Tacos',
		imageUrl: 'https://images.pexels.com/photos/128388/pexels-photo-128388.jpeg',
		price: 40000,
	},
	{
		name: 'Crab Cakes',
		imageUrl: 'https://images.pexels.com/photos/5067807/pexels-photo-5067807.jpeg',
		price: 45000,
	},
	{
		name: 'Seafood Paella',
		imageUrl: 'https://images.pexels.com/photos/5949863/pexels-photo-5949863.jpeg',
		price: 60000,
	},
	{
		name: 'Tuna Steak',
		imageUrl: 'https://images.pexels.com/photos/1603899/pexels-photo-1603899.jpeg',
		price: 55000,
	},
	{
		name: 'Garlic Butter Shrimp',
		imageUrl: 'https://images.pexels.com/photos/65175/pexels-photo-65175.jpeg',
		price: 47000,
	},
	{
		name: 'Sushi Platter',
		imageUrl: 'https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg',
		price: 62000,
	},
	{
		name: 'Clam Linguine',
		imageUrl: 'https://images.pexels.com/photos/825661/pexels-photo-825661.jpeg',
		price: 49000,
	},
];

export const Seafood = seafoodDefinitions.map((item) => {
	const id = generateSeafoodId();
	return {
		id,
		name: item.name,
		imageUrl: item.imageUrl,
		items: [
			{
				id: generateSeafoodItemId(),
				productId: id,
				productItemSizeId: 'md-001',
				price: item.price,
			},
		],
	};
});

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
			for (const ProductItemData of product.items) {
				await db.insert(productItem).values(ProductItemData);
			}
		}
		await pool.end();
	} catch (err) {
		console.error('❌ Seeding Seafood failed:', err);
		process.exit(1);
	}
}
