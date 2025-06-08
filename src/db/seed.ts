import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import 'dotenv/config';
import * as schema from './schema';
import { dataCategories } from './mockup/categories';
import {seedSeafood } from './mockup/products/foods/Seafood';
import { seedAppetizers } from './mockup/products/foods/Appetizers';


async function main() {
	console.log('🔄 Starting seed process...');
    try {
        const pool = new Pool({ connectionString: process.env.DATABASE_URL });
		const db = drizzle(pool);
        console.log('🧹 Cleaning up...');
        await db.delete(schema.products); // deletes all products
        await db.delete(schema.categories); // deletes all categories
        console.log('🗑️  Products and categories deleted');
        for (const category of dataCategories) {
            console.log('📦 Inserting category:', category.name);
            await db.insert(schema.categories).values(category);
            switch (category.name) {
                case 'Seafood':
                    seedSeafood(category.id);
                    break;
                case 'Appetizers':
                    seedAppetizers(category.id);
                    break;
                default:
                    break;
            }
            console.log('📦 Category:', category.name, 'completed');
        }
        console.log('✅ Seeding completed!');
    }
    catch (err) {
		console.error('❌ Seeding failed:', err);
		process.exit(1);
	}
}

main().catch((err) => {
	console.error('Seeding failed:', err);
	process.exit(1);
});
