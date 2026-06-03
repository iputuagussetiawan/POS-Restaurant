import { z } from 'zod';
import { db } from '@/db';
import {
	orders,
	orderItems,
	orderStatusEnum,
	paymentMethodEnum,
	products,
	customers,
	user,
} from '@/db/schema';
import { createTRPCRouter, protectedProcedure } from '@/trpc/init';
import { and, count, desc, eq, getTableColumns, gte, ilike, inArray, lt, sql } from 'drizzle-orm';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	MAX_PAGE_SIZE,
	MIN_PAGE_SIZE,
} from '../../../../constants';

const orderItemSchema = z.object({
	productId: z.string(),
	name: z.string(),
	price: z.number().positive(),
	quantity: z.number().int().positive(),
});

export const ordersRouter = createTRPCRouter({
	place: protectedProcedure
		.input(
			z.object({
				items: z.array(orderItemSchema).min(1),
				note: z.string().optional(),
				paymentMethod: z.enum(paymentMethodEnum.enumValues),
				customerName: z.string().optional(),
				customerId: z.string().optional(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const subtotal = input.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
			const tax = subtotal * 0.1;
			const total = subtotal + tax;

			const [order] = await db
				.insert(orders)
				.values({
					userId: ctx.auth.user.id,
					cashierId: ctx.auth.user.id,
					customerId: input.customerId,
					subtotal: String(subtotal.toFixed(2)),
					tax: String(tax.toFixed(2)),
					total: String(total.toFixed(2)),
					note: input.note,
					paymentMethod: input.paymentMethod,
					customerName: input.customerName,
				})
				.returning();

			// Validate which productIds still exist to avoid FK violation
			const existingIds = new Set(
				(
					await db
						.select({ id: products.id })
						.from(products)
						.where(
							inArray(
								products.id,
								input.items.map((i) => i.productId)
							)
						)
				).map((r) => r.id)
			);

			await db.insert(orderItems).values(
				input.items.map((item) => ({
					orderId: order.id,
					productId: existingIds.has(item.productId) ? item.productId : null,
					name: item.name,
					price: String(item.price.toFixed(2)),
					quantity: item.quantity,
					subtotal: String((item.price * item.quantity).toFixed(2)),
				}))
			);

			return order;
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
				status: z.enum(orderStatusEnum.enumValues).nullish(),
				search: z.string().nullish(),
				date: z.string().nullish(),
			})
		)
		.query(async ({ input, ctx }) => {
			const { page, pageSize, status, search, date } = input;

			let dayStart: Date | undefined;
			let dayEnd: Date | undefined;
			if (date) {
				dayStart = new Date(date);
				dayStart.setHours(0, 0, 0, 0);
				dayEnd = new Date(date);
				dayEnd.setHours(23, 59, 59, 999);
			}

			const where = and(
				eq(orders.userId, ctx.auth.user.id),
				status ? eq(orders.status, status) : undefined,
				search ? ilike(orders.id, `%${search}%`) : undefined,
				dayStart ? gte(orders.createdAt, dayStart) : undefined,
				dayEnd ? lt(orders.createdAt, dayEnd) : undefined
			);

			const data = await db
				.select({
					...getTableColumns(orders),
					customerName2: customers.name,
					customerPhone: customers.phone,
					cashierName: user.name,
					itemCount: sql<number>`cast(count(${orderItems.id}) as int)`,
				})
				.from(orders)
				.leftJoin(customers, eq(orders.customerId, customers.id))
				.leftJoin(user, eq(orders.cashierId, user.id))
				.leftJoin(orderItems, eq(orderItems.orderId, orders.id))
				.where(where)
				.groupBy(orders.id, customers.name, customers.phone, user.name)
				.orderBy(desc(orders.createdAt))
				.limit(pageSize)
				.offset((page - 1) * pageSize);

			const [total] = await db.select({ count: count() }).from(orders).where(where);
			return {
				items: data,
				total: total.count,
				totalPages: Math.ceil(total.count / pageSize),
			};
		}),

	getOne: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
		const [order] = await db
			.select({
				...getTableColumns(orders),
				customerName2: customers.name,
				customerPhone: customers.phone,
				customerEmail: customers.email,
				cashierName: user.name,
				cashierEmail: user.email,
			})
			.from(orders)
			.leftJoin(customers, eq(orders.customerId, customers.id))
			.leftJoin(user, eq(orders.cashierId, user.id))
			.where(ilike(orders.id, `${input.id}%`))
			.limit(1);

		if (!order) return null;

		const items = await db
			.select({
				...getTableColumns(orderItems),
				productImageUrl: products.imageUrl,
			})
			.from(orderItems)
			.leftJoin(products, eq(orderItems.productId, products.id))
			.where(eq(orderItems.orderId, input.id));

		return { ...order, items };
	}),

	updateStatus: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				status: z.enum(orderStatusEnum.enumValues),
				cancelReason: z.string().optional(),
			})
		)
		.mutation(async ({ input }) => {
			const [updated] = await db
				.update(orders)
				.set({
					status: input.status,
					updatedAt: new Date(),
					...(input.cancelReason ? { cancelReason: input.cancelReason } : {}),
				})
				.where(eq(orders.id, input.id))
				.returning();
			return updated;
		}),

	updatePaymentMethod: protectedProcedure
		.input(z.object({ id: z.string(), paymentMethod: z.enum(paymentMethodEnum.enumValues) }))
		.mutation(async ({ input }) => {
			const [updated] = await db
				.update(orders)
				.set({ paymentMethod: input.paymentMethod, updatedAt: new Date() })
				.where(eq(orders.id, input.id))
				.returning();
			return updated;
		}),
});
