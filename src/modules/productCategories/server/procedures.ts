import { z } from 'zod';
import { db } from '@/db';
import { categories } from '@/db/schema';
import { createTRPCRouter, protectedProcedure } from '@/trpc/init';
import { and, count, desc, eq, getTableColumns, ilike } from 'drizzle-orm';
import {
    DEFAULT_PAGE,
    DEFAULT_PAGE_SIZE,
    MAX_PAGE_SIZE,
    MIN_PAGE_SIZE,
} from '../../../../constants';
import { TRPCError } from '@trpc/server';
import { categoriesInsertSchema, categoriesUpdateSchema } from '../schema';

export const categoriesRouter = createTRPCRouter({
    create: protectedProcedure.input(categoriesInsertSchema).mutation(async ({ input}) => {
            const [createdProduct] = await db
                .insert(categories)
                .values(input)
                .returning();
            return createdProduct;
        }),
        
    getOne: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ input}) => {
        const [existingCategories] = await db
            .select({
                ...getTableColumns(categories),
            })
            .from(categories)
            .where(and(eq(categories.id, input.id)));

        if (!existingCategories) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Category not found',
            });
        }
        return existingCategories;
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
            })
        )
        .query(async ({input }) => {
            const { search, page, pageSize } = input;
            const data = await db
                .select({
                    
                    ...getTableColumns(categories),
                })
                .from(categories)
                .where(
                    and(
                        search ? ilike(categories.name, `%${search}%`) : undefined
                    )
                )
                .orderBy(desc(categories.createdAt), desc(categories.id))
                .limit(pageSize)
                .offset((page - 1) * pageSize);

            const [total] = await db
                .select({ count: count() })
                .from(categories)
                .where(
                    and(
                        search ? ilike(categories.name, `%${search}%`) : undefined
                    )
                );

            const totalPages = Math.ceil(total.count / pageSize);

            return {
                items: data,
                total: total.count,
                totalPages,
            };
        }),

        update: protectedProcedure.input(categoriesUpdateSchema).mutation(async ({ input }) => {
                const [updatedCategories] = await db
                    .update(categories)
                    .set(input)
                    .where(and(eq(categories.id, input.id)))
                    .returning();
                if (!updatedCategories) {
                    throw new TRPCError({
                        code: 'NOT_FOUND',
                        message: 'Categories not found',
                    });
                }
                return updatedCategories;
            }),
            remove: protectedProcedure
                .input(z.object({ id: z.string() }))
                .mutation(async ({ input }) => {
                    const [removedCategories] = await db
                        .delete(categories)
                        .where(and(eq(categories.id, input.id)))
                        .returning();
                    if (!removedCategories) {
                        throw new TRPCError({
                            code: 'NOT_FOUND',
                            message: 'Categories not found',
                        });
                    }
                    return removedCategories;
                }),
});
