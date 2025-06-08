import { z } from 'zod';
import { db } from '@/db';
import { categories, products } from '@/db/schema';
import { createTRPCRouter, protectedProcedure } from '@/trpc/init';
import { and, count, desc, eq, getTableColumns, ilike } from 'drizzle-orm';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	MAX_PAGE_SIZE,
	MIN_PAGE_SIZE,
} from '../../../../constants';
import { TRPCError } from '@trpc/server';
import { productInsertSchema, productUpdateSchema } from '../schema';

export const productsRouter = createTRPCRouter({
	create: protectedProcedure.input(productInsertSchema).mutation(async ({ input}) => {
		const [createdProduct] = await db
			.insert(products)
			.values(input)
			.returning();
		return createdProduct;
	}),
    
	getOne: protectedProcedure.input(z.object({ id: z.string() })).query(async () => {
		const [existingProduct] = await db
			.select({
				...getTableColumns(products),
			})
			.from(products);

		if (!existingProduct) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: 'Agent not found',
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
				categoryId: z.string().nullish(),
			})
		)
		.query(async ({ input }) => {
			const { search, page, pageSize, categoryId } = input;
			const data = await db
				.select({
					...getTableColumns(products),
					categories: categories,
				})
				.from(products)
				.innerJoin(categories, eq(products.categoryId, categories.id))
				.where(
					and(
						search ? ilike(products.name, `%${search}%`) : undefined,
						categoryId ? eq(products.categoryId, categoryId) : undefined
					)
				)
				.orderBy(desc(products.createdAt), desc(products.id))
				.limit(pageSize)
				.offset((page - 1) * pageSize);

			const [total] = await db
				.select({ count: count() })
				.from(products)
				.where(and(search ? ilike(products.name, `%${search}%`) : undefined));

			const totalPages = Math.ceil(total.count / pageSize);

			return {
				items: data,
				total: total.count,
				totalPages,
			};
		}),

	update: protectedProcedure.input(productUpdateSchema).mutation(async ({ input }) => {
		const [updatedProduct] = await db
			.update(products)
			.set(input)
			.where(and(eq(products.id, input.id)))
			.returning();
		if (!updatedProduct) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: 'Agent not found',
			});
		}
		return updatedProduct;
	}),
	remove: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input }) => {
			const [removedProduct] = await db
				.delete(products)
				.where(and(eq(products.id, input.id)))
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
