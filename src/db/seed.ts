import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import 'dotenv/config';
import * as schema from './schema';
import { faker } from '@faker-js/faker';
import { nanoid } from 'nanoid';
import { dataCategories } from './mockup/categories';


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
