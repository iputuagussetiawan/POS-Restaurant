import { z } from 'zod';
import { db } from '@/db';
import { categories, companySettings, products } from '@/db/schema';
import { createTRPCRouter, publicProcedure } from '@/trpc/init';
import { and, between, count, desc, eq, getTableColumns, ilike, inArray, sql } from 'drizzle-orm';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	MAX_PAGE_SIZE,
	MIN_PAGE_SIZE,
} from '../../../../constants';

export const shopRouter = createTRPCRouter({
	getProducts: publicProcedure
		.input(
			z.object({
				page: z.number().default(DEFAULT_PAGE),
				pageSize: z
					.number()
					.min(MIN_PAGE_SIZE)
					.max(MAX_PAGE_SIZE)
					.default(DEFAULT_PAGE_SIZE),
				search: z.string().nullish(),
				categorySlugs: z.array(z.string()).nullish(),
				minPrice: z.number().nullish(),
				maxPrice: z.number().nullish(),
			})
		)
		.query(async ({ input }) => {
			const { search, page, pageSize, categorySlugs, minPrice, maxPrice } = input;
			const categoryFilter =
				categorySlugs && categorySlugs.length > 0
					? inArray(categories.slug, categorySlugs)
					: undefined;
			const priceFilter =
				minPrice != null && maxPrice != null
					? between(
							sql`CAST(${products.price} AS numeric)`,
							sql`${minPrice}`,
							sql`${maxPrice}`
						)
					: undefined;
			const whereClause = and(
				search ? ilike(products.name, `%${search}%`) : undefined,
				categoryFilter,
				priceFilter
			);

			const data = await db
				.select({
					...getTableColumns(products),
					categories,
				})
				.from(products)
				.innerJoin(categories, eq(products.categoryId, categories.id))
				.where(whereClause)
				.orderBy(desc(products.createdAt), desc(products.id))
				.limit(pageSize)
				.offset((page - 1) * pageSize);

			const [total] = await db
				.select({ count: count() })
				.from(products)
				.innerJoin(categories, eq(products.categoryId, categories.id))
				.where(whereClause);

			return {
				items: data,
				total: total.count,
				totalPages: Math.ceil(total.count / pageSize),
			};
		}),

	getCategories: publicProcedure
		.input(
			z
				.object({
					search: z.string().nullish(),
					page: z.number().int().min(1).default(1),
					pageSize: z.number().int().min(1).max(50).default(8),
				})
				.optional()
		)
		.query(async ({ input }) => {
			const { search, page = 1, pageSize = 8 } = input ?? {};
			const where = search ? ilike(categories.name, `%${search}%`) : undefined;

			const data = await db
				.select({ ...getTableColumns(categories) })
				.from(categories)
				.where(where)
				.orderBy(desc(categories.createdAt), desc(categories.id))
				.limit(pageSize)
				.offset((page - 1) * pageSize);

			const [total] = await db.select({ count: count() }).from(categories).where(where);

			return {
				items: data,
				total: total.count,
				hasMore: page * pageSize < total.count,
			};
		}),

	getSettings: publicProcedure.query(async () => {
		const [settings] = await db
			.select({
				taxRate: companySettings.taxRate,
				serviceRate: companySettings.serviceRate,
				currencySymbol: companySettings.currencySymbol,
				currencyCode: companySettings.currencyCode,
			})
			.from(companySettings)
			.where(eq(companySettings.id, 'default'));
		return (
			settings ?? {
				taxRate: '0',
				serviceRate: '0',
				currencySymbol: 'Rp',
				currencyCode: 'IDR',
			}
		);
	}),
});
