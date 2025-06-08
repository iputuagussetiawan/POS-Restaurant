import { nanoid } from 'nanoid';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import 'dotenv/config';
import { products } from '@/db/schema';

function generateSoapId() {
	const unixTimestamp = Date.now();
	const randomSuffix = nanoid(4).toUpperCase();
	return `SOAP-${unixTimestamp}-${randomSuffix}`;
}

export const Soap = [
	{
		id:  generateSoapId(),
		name: 'Chicken Noodle Soup',
		imageUrl: 'https://images.pexels.com/photos/4113896/pexels-photo-4113896.jpeg',
	},
	{
		id:  generateSoapId(),
		name: 'Miso Soup',
		imageUrl: 'https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg',
	},
	{
		id:  generateSoapId(),
		name: 'Tomato Soup',
		imageUrl: 'https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg',
	},
	{
		id:  generateSoapId(),
		name: 'French Onion Soup',
		imageUrl: 'https://images.pexels.com/photos/2696064/pexels-photo-2696064.jpeg',
	},
	{
		id:  generateSoapId(),
		name: 'Clam Chowder',
		imageUrl: 'https://images.pexels.com/photos/5410415/pexels-photo-5410415.jpeg',
	},
	{
		id:  generateSoapId(),
		name: 'Lentil Soup',
		imageUrl: 'https://images.pexels.com/photos/5946704/pexels-photo-5946704.jpeg',
	},
	{
		id:  generateSoapId(),
		name: 'Cream of Mushroom',
		imageUrl: 'https://images.pexels.com/photos/1427861/pexels-photo-1427861.jpeg',
	},
	{
		id:  generateSoapId(),
		name: 'Pho',
		imageUrl: 'https://images.pexels.com/photos/2773600/pexels-photo-2773600.jpeg',
	},
	{
		id:  generateSoapId(),
		name: 'Minestrone',
		imageUrl: 'https://images.pexels.com/photos/8885744/pexels-photo-8885744.jpeg',
	},
	{
		id:  generateSoapId(),
		name: 'Butternut Squash Soup',
		imageUrl: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg',
	},
];

export async function seedSoap(categoryId: string) {
	try {
		const pool = new Pool({ connectionString: process.env.DATABASE_URL });
		const db = drizzle(pool);

		// Add categoryId dynamically here
		const soapWithCategory = Soap.map((product) => ({
			...product,
			categoryId,
		}));

		// Insert products one by one (optional)
		for (const product of soapWithCategory) {
			await db.insert(products).values(product);
		}
		await pool.end();
	} catch (err) {
		console.error('❌ Seeding Soap failed:', err);
		process.exit(1);
	}
}