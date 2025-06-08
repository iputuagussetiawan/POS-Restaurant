import { nanoid } from 'nanoid';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import 'dotenv/config';
import { products } from '@/db/schema';

function generateMainCoursesId() {
	const unixTimestamp = Date.now();
	const randomSuffix = nanoid(4).toUpperCase();
	return `MAINCOURSE-${unixTimestamp}-${randomSuffix}`;
}

export const mainCourses = [
	{
		id: generateMainCoursesId(),
		name: 'Grilled Steak',
		imageUrl: 'https://images.pexels.com/photos/6759511/pexels-photo-6759511.jpeg',
	},
	{
		id: generateMainCoursesId(),
		name: 'Spaghetti Bolognese',
		imageUrl: 'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg',
	},
	{
		id: generateMainCoursesId(),
		name: 'Butter Chicken',
		imageUrl: 'https://images.pexels.com/photos/1117863/pexels-photo-1117863.jpeg',
	},
	{
		id: generateMainCoursesId(),
		name: 'Cheeseburger',
		imageUrl: 'https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg',
	},
	{
		id: generateMainCoursesId(),
		name: 'BBQ Ribs',
		imageUrl: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg',
	},
	{
		id: generateMainCoursesId(),
		name: 'Fish and Chips',
		imageUrl: 'https://images.pexels.com/photos/7045699/pexels-photo-7045699.jpeg',
	},
	{
		id: generateMainCoursesId(),
		name: 'Roast Chicken',
		imageUrl: 'https://images.pexels.com/photos/4110007/pexels-photo-4110007.jpeg',
	},
	{
		id: generateMainCoursesId(),
		name: 'Beef Tacos',
		imageUrl: 'https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg',
	},
	{
		id: generateMainCoursesId(),
		name: 'Lamb Chops',
		imageUrl: 'https://images.pexels.com/photos/1111304/pexels-photo-1111304.jpeg',
	},
	{
		id: generateMainCoursesId(),
		name: 'Pad Thai',
		imageUrl: 'https://images.pexels.com/photos/1435895/pexels-photo-1435895.jpeg',
	},
];

export async function seedMainCourses(categoryId: string) {
	try {
		const pool = new Pool({ connectionString: process.env.DATABASE_URL });
		const db = drizzle(pool);

		// Add categoryId dynamically here
		const mainCoursesWithCategory = mainCourses.map((product) => ({
			...product,
			categoryId,
		}));

		// Insert products one by one (optional)
		for (const product of mainCoursesWithCategory) {
			await db.insert(products).values(product);
		}

		await pool.end();
	} catch (err) {
		console.error('❌ Seeding Main Courses failed:', err);
		process.exit(1);
	}
}