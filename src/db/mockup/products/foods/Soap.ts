import { nanoid } from 'nanoid';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import 'dotenv/config';
import { productItem, products } from '@/db/schema';

function generateSoupId() {
	const unixTimestamp = Date.now();
	const randomSuffix = nanoid(4).toUpperCase();
	return `SOUP-${unixTimestamp}-${randomSuffix}`;
}

function generateSoupItemId() {
	const unixTimestamp = Date.now();
	const randomSuffix = nanoid(4).toUpperCase();
	return `SOUP-ITM-${unixTimestamp}-${randomSuffix}`;
}

const soupDefinitions = [
	{
		name: 'Chicken Noodle Soup',
		imageUrl: 'https://images.pexels.com/photos/4113896/pexels-photo-4113896.jpeg',
		price: 25000,
	},
	{
		name: 'Miso Soup',
		imageUrl: 'https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg',
		price: 22000,
	},
	{
		name: 'Tomato Soup',
		imageUrl: 'https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg',
		price: 23000,
	},
	{
		name: 'French Onion Soup',
		imageUrl: 'https://images.pexels.com/photos/2696064/pexels-photo-2696064.jpeg',
		price: 27000,
	},
	{
		name: 'Clam Chowder',
		imageUrl: 'https://images.pexels.com/photos/5410415/pexels-photo-5410415.jpeg',
		price: 30000,
	},
	{
		name: 'Lentil Soup',
		imageUrl: 'https://images.pexels.com/photos/5946704/pexels-photo-5946704.jpeg',
		price: 24000,
	},
	{
		name: 'Cream of Mushroom',
		imageUrl: 'https://images.pexels.com/photos/1427861/pexels-photo-1427861.jpeg',
		price: 26000,
	},
	{
		name: 'Pho',
		imageUrl: 'https://images.pexels.com/photos/2773600/pexels-photo-2773600.jpeg',
		price: 32000,
	},
	{
		name: 'Minestrone',
		imageUrl: 'https://images.pexels.com/photos/8885744/pexels-photo-8885744.jpeg',
		price: 25000,
	},
	{
		name: 'Butternut Squash Soup',
		imageUrl: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg',
		price: 28000,
	},
];

export const Soups = soupDefinitions.map((soup) => {
	const id = generateSoupId();
	return {
		id,
		name: soup.name,
		imageUrl: soup.imageUrl,
		items: [
			{
				id: generateSoupItemId(),
				productId: id,
				productItemSizeId: 'md-001',
				price: soup.price,
			},
		],
	};
});

export async function seedSoap(categoryId: string) {
	try {
		const pool = new Pool({ connectionString: process.env.DATABASE_URL });
		const db = drizzle(pool);

		// Add categoryId dynamically here
		const soapWithCategory = Soups.map((product) => ({
			...product,
			categoryId,
		}));

		// Insert products one by one (optional)
		for (const product of soapWithCategory) {
			await db.insert(products).values(product);
			for (const ProductItemData of product.items) {
				await db.insert(productItem).values(ProductItemData);
			}
		}
		await pool.end();
	} catch (err) {
		console.error('❌ Seeding Soap failed:', err);
		process.exit(1);
	}
}
