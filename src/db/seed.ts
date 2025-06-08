import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import 'dotenv/config';
import * as schema from './schema';
import { faker } from '@faker-js/faker';
import { nanoid } from 'nanoid';

const dataCategories = [
	{
		id: nanoid(),
		name: 'Appetizers',
		description: 'E.g., spring rolls, garlic bread, chicken wings',
		imageUrl: faker.image.url(),
	},
	{
		id: nanoid(),
		name: 'Main Courses',
		description: 'E.g., grilled steak, pasta, curry, burgers',
		imageUrl: faker.image.url(),
	},
	{
		id: nanoid(),
		name: 'Desserts',
		description: 'E.g., ice cream, cake, pudding, tiramisu',
		imageUrl: faker.image.url(),
	},
	{
		id: nanoid(),
		name: 'Beverages (Non-Alcoholic)',
		description: 'E.g., coffee, tea, smoothies, soft drinks',
		imageUrl: faker.image.url(),
	},
	{
		id: nanoid(),
		name: 'Alcoholic Beverages',
		description: 'E.g., beer, wine, cocktails, spirits',
		imageUrl: faker.image.url(),
	},
	{
		id: nanoid(),
		name: 'Salads',
		description: 'E.g., Caesar salad, Greek salad, quinoa salad',
		imageUrl: faker.image.url(),
	},
	{
		id: nanoid(),
		name: 'Soups',
		description: 'E.g., miso soup, chicken noodle soup, tom yum',
		imageUrl: faker.image.url(),
	},
	{
		id: nanoid(),
		name: 'Vegan / Vegetarian Dishes',
		description: 'E.g., plant-based burgers, tofu stir-fry, lentil curry',
		imageUrl: faker.image.url(),
	},
	{
		id: nanoid(),
		name: 'Seafood',
		description: 'E.g., grilled salmon, shrimp pasta, sushi',
		imageUrl: faker.image.url(),
	},
	{
		id: nanoid(),
		name: 'Kids Menu',
		description: 'E.g., chicken nuggets, mini pizzas, juice boxes',
		imageUrl: faker.image.url(),
	},
];
async function main() {
	console.log('🔄 Starting seed process...');

	try {
		const pool = new Pool({ connectionString: process.env.DATABASE_URL });
		const db = drizzle(pool);

        for (const category of dataCategories) {
            const categoryId = nanoid();
    
            // 1. Insert category
            await db.insert(schema.categories).values({
                id: categoryId,
                name: category.name,
                description: category.description,
                imageUrl: faker.image.url(),
            });
    
            // 2. Insert 5 products for this category
            const products = Array.from({ length: 5 }).map(() => ({
                id: nanoid(),
                categoryId, // FK reference
                name: faker.commerce.productName(),
                imageUrl: faker.image.url(),
            }));
    
            await db.insert(schema.products).values(products);
            console.log(`✅ Inserted category "${category.name}" with 5 products`);
        }

		// await db.insert(schema.categories).values(dataCategories);

		await pool.end();
		console.log('✅ Database seeded successfully!');
	} catch (err) {
		console.error('❌ Seeding failed:', err);
		process.exit(1);
	}
}

main().catch((err) => {
	console.error('Seeding failed:', err);
	process.exit(1);
});
