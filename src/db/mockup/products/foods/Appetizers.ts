import { nanoid } from 'nanoid';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import 'dotenv/config';
import { productItem, products } from '@/db/schema';

function generateAppetizersId() {
	const unixTimestamp = Date.now();
	const randomSuffix = nanoid(4).toUpperCase();
	return `APPETIZER-${unixTimestamp}-${randomSuffix}`;
}

function generateAppetizersItemId() {
	const unixTimestamp = Date.now();
	const randomSuffix = nanoid(4).toUpperCase();
	return `APPETIZER-ITM-${unixTimestamp}-${randomSuffix}`;
}

const appetizerDefinitions = [
	{ name: 'Spring Rolls', imageUrl: 'https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg', price: 20000 },
	{ name: 'Garlic Bread', imageUrl: 'https://images.pexels.com/photos/3776326/pexels-photo-3776326.jpeg', price: 18000 },
	{ name: 'Chicken Wings', imageUrl: 'https://images.pexels.com/photos/1670770/pexels-photo-1670770.jpeg', price: 22000 },
	{ name: 'Mozzarella Sticks', imageUrl: 'https://images.pexels.com/photos/6759514/pexels-photo-6759514.jpeg', price: 21000 },
	{ name: 'Nachos', imageUrl: 'https://images.pexels.com/photos/105588/pexels-photo-105588.jpeg', price: 23000 },
	{ name: 'Fried Calamari', imageUrl: 'https://images.pexels.com/photos/6287764/pexels-photo-6287764.jpeg', price: 25000 },
	{ name: 'Bruschetta', imageUrl: 'https://images.pexels.com/photos/4106484/pexels-photo-4106484.jpeg', price: 19000 },
	{ name: 'Stuffed Mushrooms', imageUrl: 'https://images.pexels.com/photos/1002798/pexels-photo-1002798.jpeg', price: 24000 },
	{ name: 'Deviled Eggs', imageUrl: 'https://images.pexels.com/photos/1600717/pexels-photo-1600717.jpeg', price: 17000 },
	{ name: 'Meatballs', imageUrl: 'https://images.pexels.com/photos/6764135/pexels-photo-6764135.jpeg', price: 26000 },
];

export const Appetizers = appetizerDefinitions.map(app => {
	const appetizerId = generateAppetizersId();
	return {
		id: appetizerId,
		name: app.name,
		imageUrl: app.imageUrl,
		items: [
			{
				id: generateAppetizersItemId(),
				productId: appetizerId,
				productItemSizeId: 'md-001',
				price: app.price
			}
		]
	};
});

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

			for (const ProductItemData of product.items) {
				await db.insert(productItem).values(ProductItemData);
			}
		}

		await pool.end();
	} catch (err) {
		console.error('❌ Seeding Appetizers failed:', err);
		process.exit(1);
	}
}