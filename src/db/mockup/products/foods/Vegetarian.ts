import { nanoid } from 'nanoid';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import 'dotenv/config';
import { productItem, products } from '@/db/schema';

function generateVegetarianId() {
	const unixTimestamp = Date.now();
	const randomSuffix = nanoid(4).toUpperCase();
	return `VEGETARIAN-${unixTimestamp}-${randomSuffix}`;
}

function generateVegetarianItemId() {
	const unixTimestamp = Date.now();
	const randomSuffix = nanoid(4).toUpperCase();
	return `VEGETARIAN-ITM-${unixTimestamp}-${randomSuffix}`;
}

const vegetarianDefinitions = [
	{
		name: 'Tofu Stir-Fry',
		imageUrl: 'https://images.pexels.com/photos/1640779/pexels-photo-1640779.jpeg',
		price: 30000,
	},
	{
		name: 'Lentil Curry',
		imageUrl: 'https://images.pexels.com/photos/64208/pexels-photo-64208.jpeg',
		price: 28000,
	},
	{
		name: 'Veggie Burger',
		imageUrl: 'https://images.pexels.com/photos/1640771/pexels-photo-1640771.jpeg',
		price: 32000,
	},
	{
		name: 'Chickpea Salad',
		imageUrl: 'https://images.pexels.com/photos/7045695/pexels-photo-7045695.jpeg',
		price: 25000,
	},
	{
		name: 'Stuffed Bell Peppers',
		imageUrl: 'https://images.pexels.com/photos/5946884/pexels-photo-5946884.jpeg',
		price: 29000,
	},
	{
		name: 'Eggplant Parmesan',
		imageUrl: 'https://images.pexels.com/photos/5946688/pexels-photo-5946688.jpeg',
		price: 31000,
	},
	{
		name: 'Vegan Burrito',
		imageUrl: 'https://images.pexels.com/photos/3738760/pexels-photo-3738760.jpeg',
		price: 33000,
	},
	{
		name: 'Falafel Wrap',
		imageUrl: 'https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg',
		price: 27000,
	},
	{
		name: 'Zucchini Noodles',
		imageUrl: 'https://images.pexels.com/photos/5946852/pexels-photo-5946852.jpeg',
		price: 26000,
	},
	{
		name: 'Mushroom Risotto',
		imageUrl: 'https://images.pexels.com/photos/699953/pexels-photo-699953.jpeg',
		price: 34000,
	},
];

export const Vegetarian = vegetarianDefinitions.map((item) => {
	const id = generateVegetarianId();
	return {
		id,
		name: item.name,
		imageUrl: item.imageUrl,
		items: [
			{
				id: generateVegetarianItemId(),
				productId: id,
				productItemSizeId: 'md-001',
				price: item.price,
			},
		],
	};
});

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
			for (const ProductItemData of product.items) {
				await db.insert(productItem).values(ProductItemData);
			}
		}
		await pool.end();
	} catch (err) {
		console.error('❌ Seeding Vegetarian failed:', err);
		process.exit(1);
	}
}
