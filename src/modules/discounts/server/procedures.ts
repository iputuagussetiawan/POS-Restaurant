import { z } from 'zod';
import { db } from '@/db';
import { discounts } from '@/db/schema';
import { createTRPCRouter, protectedProcedure } from '@/trpc/init';
import { and, count, desc, eq, getTableColumns, ilike, inArray, or } from 'drizzle-orm';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	MAX_PAGE_SIZE,
	MIN_PAGE_SIZE,
} from '../../../../constants';
import { TRPCError } from '@trpc/server';
import { discountInsertSchema, discountUpdateSchema } from '../schema';

export const discountsRouter = createTRPCRouter({
	create: protectedProcedure.input(discountInsertSchema).mutation(async ({ input, ctx }) => {
		const [existing] = await db
			.select({ id: discounts.id })
			.from(discounts)
			.where(eq(discounts.code, input.code.toUpperCase()));
		if (existing) {
			throw new TRPCError({ code: 'CONFLICT', message: 'Discount code already exists.' });
		}
		const [created] = await db
			.insert(discounts)
			.values({
				...input,
				code: input.code.toUpperCase(),
				value: String(input.value),
				minOrderAmount: input.minOrderAmount != null ? String(input.minOrderAmount) : null,
				expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
				createdBy: ctx.auth.user.id,
			})
			.returning();
		return created;
	}),

	getOne: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
		const [discount] = await db
			.select({ ...getTableColumns(discounts) })
			.from(discounts)
			.where(eq(discounts.id, input.id));
		if (!discount) {
			throw new TRPCError({ code: 'NOT_FOUND', message: 'Discount not found.' });
		}
		return discount;
	}),

	getByCode: protectedProcedure.input(z.object({ code: z.string() })).query(async ({ input }) => {
		const [discount] = await db
			.select({ ...getTableColumns(discounts) })
			.from(discounts)
			.where(eq(discounts.code, input.code.toUpperCase()));
		if (!discount) {
			throw new TRPCError({ code: 'NOT_FOUND', message: 'Discount code not found.' });
		}
		if (!discount.isActive) {
			throw new TRPCError({ code: 'BAD_REQUEST', message: 'This discount is inactive.' });
		}
		if (discount.expiresAt && discount.expiresAt < new Date()) {
			throw new TRPCError({ code: 'BAD_REQUEST', message: 'This discount has expired.' });
		}
		if (discount.maxUses != null && discount.usedCount >= discount.maxUses) {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: 'This discount has reached its usage limit.',
			});
		}
		return discount;
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
				status: z.enum(['all', 'active', 'inactive']).default('all'),
			})
		)
		.query(async ({ input }) => {
			const { search, page, pageSize, status } = input;

			const searchFilter = search
				? or(ilike(discounts.name, `%${search}%`), ilike(discounts.code, `%${search}%`))
				: undefined;

			const statusFilter =
				status === 'active'
					? eq(discounts.isActive, true)
					: status === 'inactive'
						? eq(discounts.isActive, false)
						: undefined;

			const where = and(searchFilter, statusFilter);

			const data = await db
				.select({ ...getTableColumns(discounts) })
				.from(discounts)
				.where(where)
				.orderBy(desc(discounts.createdAt), desc(discounts.id))
				.limit(pageSize)
				.offset((page - 1) * pageSize);

			const [total] = await db.select({ count: count() }).from(discounts).where(where);

			return {
				items: data,
				total: total.count,
				totalPages: Math.ceil(total.count / pageSize),
			};
		}),

	update: protectedProcedure.input(discountUpdateSchema).mutation(async ({ input }) => {
		const codeConflict = await db
			.select({ id: discounts.id })
			.from(discounts)
			.where(eq(discounts.code, input.code.toUpperCase()));
		if (codeConflict.length > 0 && codeConflict[0].id !== input.id) {
			throw new TRPCError({ code: 'CONFLICT', message: 'Discount code already in use.' });
		}

		const [updated] = await db
			.update(discounts)
			.set({
				...input,
				code: input.code.toUpperCase(),
				value: String(input.value),
				minOrderAmount: input.minOrderAmount != null ? String(input.minOrderAmount) : null,
				expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
				updatedAt: new Date(),
			})
			.where(eq(discounts.id, input.id))
			.returning();

		if (!updated) {
			throw new TRPCError({ code: 'NOT_FOUND', message: 'Discount not found.' });
		}
		return updated;
	}),

	toggleActive: protectedProcedure
		.input(z.object({ id: z.string(), isActive: z.boolean() }))
		.mutation(async ({ input }) => {
			const [updated] = await db
				.update(discounts)
				.set({ isActive: input.isActive, updatedAt: new Date() })
				.where(eq(discounts.id, input.id))
				.returning();
			if (!updated) {
				throw new TRPCError({ code: 'NOT_FOUND', message: 'Discount not found.' });
			}
			return updated;
		}),

	remove: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
		const [removed] = await db.delete(discounts).where(eq(discounts.id, input.id)).returning();
		if (!removed) {
			throw new TRPCError({ code: 'NOT_FOUND', message: 'Discount not found.' });
		}
		return removed;
	}),

	bulkRemove: protectedProcedure
		.input(z.object({ ids: z.array(z.string()).min(1) }))
		.mutation(async ({ input }) => {
			const removed = await db
				.delete(discounts)
				.where(inArray(discounts.id, input.ids))
				.returning({ id: discounts.id });
			return { count: removed.length };
		}),
});
