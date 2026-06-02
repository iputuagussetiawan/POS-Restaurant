import { nanoid } from 'nanoid';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import 'dotenv/config';
import { productItem, products } from '@/db/schema';

function generateDessertsId() {
	const unixTimestamp = Date.now();
	const randomSuffix = nanoid(4).toUpperCase();
	return `DESSERT-${unixTimestamp}-${randomSuffix}`;
}

function generateDessertsItemId() {
	const unixTimestamp = Date.now();
	const randomSuffix = nanoid(4).toUpperCase();
	return `DESSERT-ITM-${unixTimestamp}-${randomSuffix}`;
}

const dessertDefinitions = [
	{
		name: 'Chocolate Cake',
		imageUrl: 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg',
		price: 25000,
	},
	{
		name: 'Ice Cream Sundae',
		imageUrl: 'https://images.pexels.com/photos/4109994/pexels-photo-4109994.jpeg',
		price: 22000,
	},
	{
		name: 'Tiramisu',
		imageUrl: 'https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg',
		price: 28000,
	},
	{
		name: 'Cheesecake',
		imageUrl: 'https://images.pexels.com/photos/7045693/pexels-photo-7045693.jpeg',
		price: 27000,
	},
	{
		name: 'Brownies',
		imageUrl: 'https://images.pexels.com/photos/108370/pexels-photo-108370.jpeg',
		price: 20000,
	},
	{
		name: 'Fruit Tart',
		imageUrl: 'https://images.pexels.com/photos/3026809/pexels-photo-3026809.jpeg',
		price: 26000,
	},
	{
		name: 'Crème Brûlée',
		imageUrl: 'https://images.pexels.com/photos/533325/pexels-photo-533325.jpeg',
		price: 29000,
	},
	{
		name: 'Donuts',
		imageUrl: 'https://images.pexels.com/photos/3026806/pexels-photo-3026806.jpeg',
		price: 18000,
	},
	{
		name: 'Macarons',
		imageUrl: 'https://images.pexels.com/photos/1571784/pexels-photo-1571784.jpeg',
		price: 23000,
	},
	{
		name: 'Panna Cotta',
		imageUrl: 'https://images.pexels.com/photos/7045694/pexels-photo-7045694.jpeg',
		price: 24000,
	},
];

export const Desserts = dessertDefinitions.map((dessert) => {
	const dessertId = generateDessertsId();
	return {
		id: dessertId,
		name: dessert.name,
		imageUrl: dessert.imageUrl,
		items: [
			{
				id: generateDessertsItemId(),
				productId: dessertId,
				productItemSizeId: 'md-001',
				price: dessert.price,
			},
		],
	};
});

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
			for (const ProductItemData of product.items) {
				await db.insert(productItem).values(ProductItemData);
			}
		}

		await pool.end();
	} catch (err) {
		console.error('❌ Seeding Desserts failed:', err);
		process.exit(1);
	}
}
