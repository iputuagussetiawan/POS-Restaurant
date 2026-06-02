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

const toSlug = (name: string) =>
	name
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-');

const CATEGORY_PRODUCTS: Record<
	string,
	{ name: string; imageUrl: string; description?: string; price?: number; images?: string[] }[]
> = {
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

		let adminUserId = '';

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

			if (u.role === 'admin') adminUserId = userId;

			console.log(`  ✅ ${u.role.padEnd(9)} — ${u.email}  (pw: ${u.password})`);
		}

		// ── Categories & Products ────────────────────────────────
		console.log('\n🍽️  Seeding categories & products...');
		await db.delete(products);
		await db.delete(categories);

		// base date: 30 days ago, each category 3 days apart
		const BASE_DATE = new Date();
		BASE_DATE.setDate(BASE_DATE.getDate() - 30);

		for (let i = 0; i < categoriesData.length; i++) {
			const categoryData = categoriesData[i];
			const categoryId = nanoid();
			console.log(`  📦 ${categoryData.name}`);

			const categoryCreatedAt = new Date(BASE_DATE);
			categoryCreatedAt.setDate(categoryCreatedAt.getDate() + i * 3);
			const categoryUpdatedAt = new Date(categoryCreatedAt);
			categoryUpdatedAt.setHours(categoryUpdatedAt.getHours() + 1);

			await db.insert(categories).values({
				id: categoryId,
				...categoryData,
				createdBy: adminUserId,
				createdAt: categoryCreatedAt,
				updatedAt: categoryUpdatedAt,
			});

			const productItems = CATEGORY_PRODUCTS[categoryData.name];
			if (productItems?.length) {
				await db.insert(products).values(
					productItems.map((p, j) => {
						// each product 2 hours after the category, then 30 min apart
						const productCreatedAt = new Date(categoryCreatedAt);
						productCreatedAt.setMinutes(productCreatedAt.getMinutes() + 120 + j * 30);
						const productUpdatedAt = new Date(productCreatedAt);
						productUpdatedAt.setMinutes(productUpdatedAt.getMinutes() + 10);
						const basePrice = p.price ?? 5 + Math.floor(j * 1.5 + i * 2);
						return {
							id: nanoid(),
							categoryId,
							createdBy: adminUserId,
							name: p.name,
							slug: toSlug(p.name),
							description: p.description ?? null,
							price: basePrice.toFixed(2),
							isAvailable: true,
							imageUrl: p.imageUrl,
							images: p.images ?? [],
							createdAt: productCreatedAt,
							updatedAt: productUpdatedAt,
						};
					})
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
