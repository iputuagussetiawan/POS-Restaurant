import { nanoid } from 'nanoid';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import 'dotenv/config';
import { productItem } from '@/db/schema';

function generateProductItemId() {
	const unixTimestamp = Date.now();
	const randomSuffix = nanoid(4).toUpperCase();
	return `ITM-${unixTimestamp}-${randomSuffix}`;
}


export const ProductItems = [
	{
		id: generateProductItemId(),
		productId: 'Pizza-001',
		productItemSizeId: 'lg-001',
		price:50000
	},
	{
		id: generateProductItemId(),
		productId: 'Pizza-001',
		productItemSizeId: 'md-001',
		price:40000
	},
	{
		id: generateProductItemId(),
		productId: 'Pizza-001',
		productItemSizeId: 'sm-001',
		price:30000
	},

	{
		id: generateProductItemId(),
		productId: 'Pizza-002',
		productItemSizeId: 'lg-001',
		price:50000
	},
	{
		id: generateProductItemId(),
		productId: 'Pizza-002',
		productItemSizeId: 'md-001',
		price:40000
	},
	{
		id: generateProductItemId(),
		productId: 'Pizza-002',
		productItemSizeId: 'sm-001',
		price:30000
	},

	{
		id: generateProductItemId(),
		productId: 'Pizza-003',
		productItemSizeId: 'lg-001',
		price:50000
	},
	{
		id: generateProductItemId(),
		productId: 'Pizza-003',
		productItemSizeId: 'md-001',
		price:40000
	},
	
	{
		id: generateProductItemId(),
		productId: 'Pizza-003',
		productItemSizeId: 'sm-001',
		price:30000
	},
];

export async function seedProductItems() {
	try {
		const pool = new Pool({ connectionString: process.env.DATABASE_URL });
		const db = drizzle(pool);

		// Insert products one by one (optional)
		console.log('📦 Inserting Product items');
		for (const ProductItemData of ProductItems) {
			await db.insert(productItem).values(ProductItemData);
		}
		console.log('✅ Product item inserted completed');

		await pool.end();
	} catch (err) {
		console.error('❌ Seeding Product Item failed:', err);
		process.exit(1);
	}
}