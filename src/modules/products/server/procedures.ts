import { z } from 'zod';
import { db } from '@/db';
import { categories, productItem, products } from '@/db/schema';
import { createTRPCRouter, protectedProcedure } from '@/trpc/init';
import { and, between, count, desc, eq, getTableColumns, ilike, inArray, sql } from 'drizzle-orm';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	MAX_PAGE_SIZE,
	MIN_PAGE_SIZE,
} from '../../../../constants';
import { TRPCError } from '@trpc/server';
import { productInsertSchema, productUpdateSchema } from '../schema';
import { toSlug } from '@/lib/utils';

export const productsRouter = createTRPCRouter({
	create: protectedProcedure.input(productInsertSchema).mutation(async ({ input, ctx }) => {
		const slug = input.slug ?? toSlug(input.name);
		const [createdProduct] = await db
			.insert(products)
			.values({
				...input,
				slug,
				price: String(input.price),
				createdBy: ctx.auth.user.id,
			})
			.returning();
		return createdProduct;
	}),

	getOne: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
		const [existingProduct] = await db
			.select({
				...getTableColumns(products),
				categories,
			})
			.from(products)
			.innerJoin(categories, eq(products.categoryId, categories.id))
			.where(eq(products.id, input.id));

		if (!existingProduct) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: 'Product not found',
			});
		}
		return existingProduct;
	}),

	getMany: protectedProcedure
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
					categories: categories,
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

			const totalPages = Math.ceil(total.count / pageSize);

			return {
				items: data,
				total: total.count,
				totalPages,
			};
		}),

	update: protectedProcedure.input(productUpdateSchema).mutation(async ({ input, ctx }) => {
		const slug = input.slug ?? toSlug(input.name);
		const [updatedProduct] = await db
			.update(products)
			.set({ ...input, slug, price: String(input.price) })
			.where(and(eq(products.id, input.id), eq(products.createdBy, ctx.auth.user.id)))
			.returning();
		if (!updatedProduct) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: 'Product not found',
			});
		}
		return updatedProduct;
	}),

	remove: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const [removedProduct] = await db
				.delete(products)
				.where(and(eq(products.id, input.id), eq(products.createdBy, ctx.auth.user.id)))
				.returning();
			if (!removedProduct) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Product not found',
				});
			}
			return removedProduct;
		}),
});
