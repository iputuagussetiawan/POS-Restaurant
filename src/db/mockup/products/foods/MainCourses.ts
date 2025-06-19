import { nanoid } from 'nanoid';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import 'dotenv/config';
import { productItem, products } from '@/db/schema';

function generateMainCoursesId() {
	const unixTimestamp = Date.now();
	const randomSuffix = nanoid(4).toUpperCase();
	return `MAINCOURSE-${unixTimestamp}-${randomSuffix}`;
}

function generateMainCoursesItemId() {
	const unixTimestamp = Date.now();
	const randomSuffix = nanoid(4).toUpperCase();
	return `MAINCOURSE-ITM-${unixTimestamp}-${randomSuffix}`;
}

// Raw course definitions (without id)
const courseDefinitions = [
	{ name: 'Grilled Steak', imageUrl: 'https://images.pexels.com/photos/6759511/pexels-photo-6759511.jpeg', price: 40000 },
	{ name: 'Spaghetti Bolognese', imageUrl: 'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg', price: 35000 },
	{ name: 'Butter Chicken', imageUrl: 'https://images.pexels.com/photos/1117863/pexels-photo-1117863.jpeg', price: 38000 },
	{ name: 'Cheeseburger', imageUrl: 'https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg', price: 32000 },
	{ name: 'BBQ Ribs', imageUrl: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg', price: 45000 },
	{ name: 'Fish and Chips', imageUrl: 'https://images.pexels.com/photos/7045699/pexels-photo-7045699.jpeg', price: 33000 },
	{ name: 'Roast Chicken', imageUrl: 'https://images.pexels.com/photos/4110007/pexels-photo-4110007.jpeg', price: 39000 },
	{ name: 'Beef Tacos', imageUrl: 'https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg', price: 31000 },
	{ name: 'Lamb Chops', imageUrl: 'https://images.pexels.com/photos/1111304/pexels-photo-1111304.jpeg', price: 47000 },
	{ name: 'Pad Thai', imageUrl: 'https://images.pexels.com/photos/1435895/pexels-photo-1435895.jpeg', price: 30000 },
];

// Generate mainCourses with consistent IDs
export const mainCourses = courseDefinitions.map(course => {
	const courseId = generateMainCoursesId();
	return {
		id: courseId,
		name: course.name,
		imageUrl: course.imageUrl,
		items: [
			{
				id: generateMainCoursesItemId(),
				productId: courseId,
				productItemSizeId: 'md-001',
				price: course.price
			}
		]
	};
});

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
			for (const ProductItemData of product.items) {
				await db.insert(productItem).values(ProductItemData);
			}
		}

		await pool.end();
	} catch (err) {
		console.error('❌ Seeding Main Courses failed:', err);
		process.exit(1);
	}
}