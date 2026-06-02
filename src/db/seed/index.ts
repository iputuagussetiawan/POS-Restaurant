import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { nanoid } from 'nanoid';
import { hashPassword } from 'better-auth/crypto';
import { categories, products, user, account } from '../schema';

import { categoriesData } from './data/categories';
import { usersData } from './data/users';
import { appetizers } from './data/products/appetizers';
import { mainCourses } from './data/products/main-courses';
import { desserts } from './data/products/desserts';
import { nonAlcoholic } from './data/products/non-alcoholic';
import { alcoholic } from './data/products/alcoholic';
import { salads } from './data/products/salads';
import { soups } from './data/products/soups';
import { vegetarian } from './data/products/vegetarian';
import { seafood } from './data/products/seafood';
import { kidsMenu } from './data/products/kids-menu';

const CATEGORY_PRODUCTS: Record<string, { name: string; imageUrl: string }[]> = {
	Appetizers: appetizers,
	'Main Courses': mainCourses,
	Desserts: desserts,
	'Beverages (Non-Alcoholic)': nonAlcoholic,
	'Alcoholic Beverages': alcoholic,
	Salads: salads,
	Soups: soups,
	'Vegan / Vegetarian Dishes': vegetarian,
	Seafood: seafood,
	'Kids Menu': kidsMenu,
};

async function main() {
	console.log('🔄 Starting seed process...');

	const pool = new Pool({ connectionString: process.env.DATABASE_URL });
	const db = drizzle(pool);

	try {
		// ── Users ────────────────────────────────────────────────
		console.log('\n👤 Seeding users...');
		await db.delete(account);
		await db.delete(user);

		for (const u of usersData) {
			const userId = nanoid();
			const hashedPassword = await hashPassword(u.password);
			const now = new Date();

			await db.insert(user).values({
				id: userId,
				name: u.name,
				email: u.email,
				emailVerified: true,
				role: u.role,
				createdAt: now,
				updatedAt: now,
			});

			await db.insert(account).values({
				id: nanoid(),
				accountId: userId,
				providerId: 'credential',
				userId,
				password: hashedPassword,
				createdAt: now,
				updatedAt: now,
			});

			console.log(`  ✅ ${u.role.padEnd(9)} — ${u.email}  (pw: ${u.password})`);
		}

		// ── Categories & Products ────────────────────────────────
		console.log('\n🍽️  Seeding categories & products...');
		await db.delete(products);
		await db.delete(categories);

		for (const categoryData of categoriesData) {
			const categoryId = nanoid();
			console.log(`  📦 ${categoryData.name}`);

			await db.insert(categories).values({ id: categoryId, ...categoryData });

			const productItems = CATEGORY_PRODUCTS[categoryData.name];
			if (productItems?.length) {
				await db.insert(products).values(
					productItems.map((p) => ({
						id: nanoid(),
						categoryId,
						name: p.name,
						imageUrl: p.imageUrl,
					}))
				);
				console.log(`     ↳ ${productItems.length} products inserted`);
			}
		}

		console.log('\n✅ Seeding completed!');
	} catch (err) {
		console.error('❌ Seeding failed:', err);
		process.exit(1);
	} finally {
		await pool.end();
	}
}

main();
