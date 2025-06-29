import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import 'dotenv/config';
import * as schema from './schema';
import { dataCategories } from './mockup/categories';
import { seedSeafood } from './mockup/products/foods/Seafood';
import { seedAppetizers } from './mockup/products/foods/Appetizers';
import { seedKidsMenu } from './mockup/products/foods/KidsMenu';
import { seedDesserts } from './mockup/products/foods/Desserts';
import { seedMainCourses } from './mockup/products/foods/MainCourses';
import { seedSalads } from './mockup/products/foods/Salad';
import { seedSoap } from './mockup/products/foods/Soap';
import { seedVegetarian } from './mockup/products/foods/Vegetarian';
import { seedAlcoholic } from './mockup/products/beverage/Alcohol';
import { seedNonAlcoholic } from './mockup/products/beverage/NoAlcohol';

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
				case 'Desserts':
					seedDesserts(category.id);
					break;
				case 'Kids Menu':
					seedKidsMenu(category.id);
					break;
				case 'Main Courses':
					seedMainCourses(category.id);
					break;
                case 'Salads':
					seedSalads(category.id);
					break;
				case 'Soap':
					seedSoap(category.id);
					break;
				case 'Vegetarian':
					seedVegetarian(category.id);
					break;
				case 'Alcoholic Beverages':
					seedAlcoholic(category.id);
					break;
				case 'Beverages (Non-Alcoholic)':
					seedNonAlcoholic(category.id);
					break;
				default:
					break;
			}
			console.log('✅ Category:', category.name, 'completed');
		}
		console.log('✅ Seeding completed!');
	} catch (err) {
		console.error('❌ Seeding failed:', err);
		process.exit(1);
	}
}

main().catch((err) => {
	console.error('Seeding failed:', err);
	process.exit(1);
});
