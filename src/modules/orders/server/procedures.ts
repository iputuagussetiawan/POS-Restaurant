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
	companySettings,
	discounts,
} from '@/db/schema';
import { createTRPCRouter, protectedProcedure } from '@/trpc/init';
import { TRPCError } from '@trpc/server';
import { and, count, desc, eq, getTableColumns, gte, ilike, inArray, lt, sql } from 'drizzle-orm';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	MAX_PAGE_SIZE,
	MIN_PAGE_SIZE,
} from '../../../../constants';

async function getSettings() {
	const [s] = await db
		.select({
			taxRate: companySettings.taxRate,
			serviceRate: companySettings.serviceRate,
			timezone: companySettings.timezone,
		})
		.from(companySettings)
		.where(eq(companySettings.id, 'default'));
	return {
		taxRate: Number(s?.taxRate ?? 10),
		serviceRate: Number(s?.serviceRate ?? 0),
		timezone: s?.timezone ?? 'UTC',
	};
}

/**
 * Returns the UTC Date objects for start and end of a calendar day
 * as seen in the given IANA timezone.
 *
 * e.g. "2024-01-15" + "Asia/Makassar" (UTC+8)
 *   → start = 2024-01-14T16:00:00Z, end = 2024-01-15T15:59:59.999Z
 */
function dayBoundsInTz(dateStr: string, timezone: string): { start: Date; end: Date } {
	// Use noon UTC as a probe — avoids DST ambiguity at midnight
	const noonUtc = new Date(`${dateStr}T12:00:00Z`);

	// en-CA locale gives "YYYY-MM-DD, HH:MM:SS" — easy to parse back
	const localStr = new Intl.DateTimeFormat('en-CA', {
		timeZone: timezone,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: false,
	}).format(noonUtc);

	// Parse the formatted local time as if it were UTC to compute the offset
	const localAsUtcMs = new Date(localStr.replace(', ', 'T') + 'Z').getTime();
	const offsetMs = localAsUtcMs - noonUtc.getTime(); // positive for UTC+ zones

	// Midnight UTC on dateStr, shifted by the zone offset → midnight in target TZ
	const midnightUtcMs = new Date(`${dateStr}T00:00:00Z`).getTime();
	const start = new Date(midnightUtcMs - offsetMs);
	const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
	return { start, end };
}

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
				discountCode: z.string().optional(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const { taxRate, serviceRate } = await getSettings();
			const subtotal = input.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
			const tax = subtotal * (taxRate / 100);
			const serviceCharge = subtotal * (serviceRate / 100);
			const preTaxTotal = subtotal + tax + serviceCharge;

			// Resolve discount
			let discountAmount = 0;
			let appliedDiscountCode: string | undefined;

			if (input.discountCode) {
				const code = input.discountCode.toUpperCase();
				const [discount] = await db
					.select()
					.from(discounts)
					.where(eq(discounts.code, code));

				if (!discount)
					throw new TRPCError({
						code: 'BAD_REQUEST',
						message: 'Discount code not found.',
					});
				if (!discount.isActive)
					throw new TRPCError({
						code: 'BAD_REQUEST',
						message: 'This discount is inactive.',
					});
				if (discount.expiresAt && discount.expiresAt < new Date())
					throw new TRPCError({
						code: 'BAD_REQUEST',
						message: 'This discount has expired.',
					});
				if (discount.maxUses != null && discount.usedCount >= discount.maxUses)
					throw new TRPCError({
						code: 'BAD_REQUEST',
						message: 'This discount has reached its usage limit.',
					});
				if (
					discount.minOrderAmount != null &&
					preTaxTotal < Number(discount.minOrderAmount)
				) {
					throw new TRPCError({
						code: 'BAD_REQUEST',
						message: `Minimum order amount for this discount is ${Number(discount.minOrderAmount).toFixed(2)}.`,
					});
				}

				discountAmount =
					discount.type === 'percentage'
						? (preTaxTotal * Number(discount.value)) / 100
						: Number(discount.value);

				discountAmount = Math.min(discountAmount, preTaxTotal);
				appliedDiscountCode = code;

				await db
					.update(discounts)
					.set({ usedCount: discount.usedCount + 1, updatedAt: new Date() })
					.where(eq(discounts.id, discount.id));
			}

			const total = Math.max(0, preTaxTotal - discountAmount);

			const [order] = await db
				.insert(orders)
				.values({
					userId: ctx.auth.user.id,
					cashierId: ctx.auth.user.id,
					customerId: input.customerId,
					subtotal: String(subtotal.toFixed(2)),
					tax: String(tax.toFixed(2)),
					serviceCharge: String(serviceCharge.toFixed(2)),
					discountAmount: String(discountAmount.toFixed(2)),
					discountCode: appliedDiscountCode,
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
				dateFrom: z.string().nullish(),
				dateTo: z.string().nullish(),
				sortOrder: z.enum(['asc', 'desc']).default('desc'),
			})
		)
		.query(async ({ input, ctx }) => {
			const { page, pageSize, status, search, dateFrom, dateTo, sortOrder } = input;
			const { timezone } = await getSettings();

			let rangeStart: Date | undefined;
			let rangeEnd: Date | undefined;
			if (dateFrom) rangeStart = dayBoundsInTz(dateFrom, timezone).start;
			if (dateTo) rangeEnd = dayBoundsInTz(dateTo, timezone).end;

			const where = and(
				status ? eq(orders.status, status) : undefined,
				search ? ilike(orders.id, `%${search}%`) : undefined,
				rangeStart ? gte(orders.createdAt, rangeStart) : undefined,
				rangeEnd ? lt(orders.createdAt, rangeEnd) : undefined
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
				.orderBy(sortOrder === 'asc' ? orders.createdAt : desc(orders.createdAt))
				.limit(pageSize)
				.offset((page - 1) * pageSize);

			const [total] = await db.select({ count: count() }).from(orders).where(where);
			return {
				items: data,
				total: total.count,
				totalPages: Math.ceil(total.count / pageSize),
			};
		}),

	statusCounts: protectedProcedure
		.input(
			z.object({
				search: z.string().nullish(),
				dateFrom: z.string().nullish(),
				dateTo: z.string().nullish(),
			})
		)
		.query(async ({ input }) => {
			const { search, dateFrom, dateTo } = input;
			const { timezone } = await getSettings();

			let rangeStart: Date | undefined;
			let rangeEnd: Date | undefined;
			if (dateFrom) rangeStart = dayBoundsInTz(dateFrom, timezone).start;
			if (dateTo) rangeEnd = dayBoundsInTz(dateTo, timezone).end;

			const where = and(
				search ? ilike(orders.id, `%${search}%`) : undefined,
				rangeStart ? gte(orders.createdAt, rangeStart) : undefined,
				rangeEnd ? lt(orders.createdAt, rangeEnd) : undefined
			);

			const rows = await db
				.select({ status: orders.status, count: count() })
				.from(orders)
				.where(where)
				.groupBy(orders.status);

			const result = { pending: 0, processing: 0, completed: 0, cancelled: 0 };
			for (const row of rows) {
				if (row.status in result) result[row.status as keyof typeof result] = row.count;
			}
			return result;
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

	chartData: protectedProcedure
		.input(
			z.object({
				search: z.string().nullish(),
				dateFrom: z.string().nullish(),
				dateTo: z.string().nullish(),
			})
		)
		.query(async ({ input }) => {
			const { search, dateFrom, dateTo } = input;
			const { timezone } = await getSettings();

			let rangeStart: Date | undefined;
			let rangeEnd: Date | undefined;
			if (dateFrom) rangeStart = dayBoundsInTz(dateFrom, timezone).start;
			if (dateTo) rangeEnd = dayBoundsInTz(dateTo, timezone).end;

			const where = and(
				search ? ilike(orders.id, `%${search}%`) : undefined,
				rangeStart ? gte(orders.createdAt, rangeStart) : undefined,
				rangeEnd ? lt(orders.createdAt, rangeEnd) : undefined
			);

			// Orders & revenue by day
			const byDay = await db
				.select({
					date: sql<string>`to_char(${orders.createdAt}, 'YYYY-MM-DD')`,
					orderCount: count(),
					revenue: sql<string>`coalesce(sum(cast(${orders.total} as numeric)), 0)`,
				})
				.from(orders)
				.where(where)
				.groupBy(sql`to_char(${orders.createdAt}, 'YYYY-MM-DD')`)
				.orderBy(sql`to_char(${orders.createdAt}, 'YYYY-MM-DD')`);

			// Orders by hour of day (0-23)
			const byHour = await db
				.select({
					hour: sql<number>`cast(extract(hour from ${orders.createdAt}) as int)`,
					orderCount: count(),
				})
				.from(orders)
				.where(where)
				.groupBy(sql`extract(hour from ${orders.createdAt})`)
				.orderBy(sql`extract(hour from ${orders.createdAt})`);

			// Payment method breakdown
			const byPayment = await db
				.select({
					method: orders.paymentMethod,
					orderCount: count(),
					revenue: sql<string>`coalesce(sum(cast(${orders.total} as numeric)), 0)`,
				})
				.from(orders)
				.where(where)
				.groupBy(orders.paymentMethod);

			// Status breakdown
			const byStatus = await db
				.select({
					status: orders.status,
					orderCount: count(),
				})
				.from(orders)
				.where(where)
				.groupBy(orders.status);

			// Fill hour gaps
			const hourMap = new Map(byHour.map((r) => [r.hour, r.orderCount]));
			const hoursFilled = Array.from({ length: 24 }, (_, h) => ({
				hour: h,
				label: `${String(h).padStart(2, '0')}:00`,
				orderCount: hourMap.get(h) ?? 0,
			}));

			return { byDay, byHour: hoursFilled, byPayment, byStatus };
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
