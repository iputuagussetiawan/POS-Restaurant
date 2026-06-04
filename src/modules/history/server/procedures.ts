import { z } from 'zod';
import { db } from '@/db';
import {
	orders,
	orderItems,
	orderStatusEnum,
	paymentMethodEnum,
	customers,
	user,
	companySettings,
} from '@/db/schema';
import { createTRPCRouter, protectedProcedure } from '@/trpc/init';
import { and, count, desc, eq, getTableColumns, gte, ilike, lt, sql, sum, ne } from 'drizzle-orm';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	MAX_PAGE_SIZE,
	MIN_PAGE_SIZE,
} from '../../../../constants';

async function getTimezone() {
	const [s] = await db
		.select({ timezone: companySettings.timezone })
		.from(companySettings)
		.where(eq(companySettings.id, 'default'));
	return s?.timezone ?? 'UTC';
}

function dayBoundsInTz(dateStr: string, timezone: string): { start: Date; end: Date } {
	const noonUtc = new Date(`${dateStr}T12:00:00Z`);
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
	const localAsUtcMs = new Date(localStr.replace(', ', 'T') + 'Z').getTime();
	const offsetMs = localAsUtcMs - noonUtc.getTime();
	const midnightUtcMs = new Date(`${dateStr}T00:00:00Z`).getTime();
	const start = new Date(midnightUtcMs - offsetMs);
	const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
	return { start, end };
}

export const historyRouter = createTRPCRouter({
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
				status: z.enum(orderStatusEnum.enumValues).nullish(),
				paymentMethod: z.enum(paymentMethodEnum.enumValues).nullish(),
				dateFrom: z.string().nullish(),
				dateTo: z.string().nullish(),
			})
		)
		.query(async ({ input }) => {
			const { page, pageSize, search, status, paymentMethod, dateFrom, dateTo } = input;
			const timezone = await getTimezone();

			let rangeStart: Date | undefined;
			let rangeEnd: Date | undefined;
			if (dateFrom) rangeStart = dayBoundsInTz(dateFrom, timezone).start;
			if (dateTo) rangeEnd = dayBoundsInTz(dateTo, timezone).end;

			const where = and(
				search ? ilike(orders.id, `%${search}%`) : undefined,
				status ? eq(orders.status, status) : undefined,
				paymentMethod ? eq(orders.paymentMethod, paymentMethod) : undefined,
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

	export: protectedProcedure
		.input(
			z.object({
				search: z.string().nullish(),
				status: z.enum(orderStatusEnum.enumValues).nullish(),
				paymentMethod: z.enum(paymentMethodEnum.enumValues).nullish(),
				dateFrom: z.string().nullish(),
				dateTo: z.string().nullish(),
			})
		)
		.query(async ({ input }) => {
			const { search, status, paymentMethod, dateFrom, dateTo } = input;
			const timezone = await getTimezone();

			let rangeStart: Date | undefined;
			let rangeEnd: Date | undefined;
			if (dateFrom) rangeStart = dayBoundsInTz(dateFrom, timezone).start;
			if (dateTo) rangeEnd = dayBoundsInTz(dateTo, timezone).end;

			const where = and(
				search ? ilike(orders.id, `%${search}%`) : undefined,
				status ? eq(orders.status, status) : undefined,
				paymentMethod ? eq(orders.paymentMethod, paymentMethod) : undefined,
				rangeStart ? gte(orders.createdAt, rangeStart) : undefined,
				rangeEnd ? lt(orders.createdAt, rangeEnd) : undefined
			);

			return db
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
				.orderBy(desc(orders.createdAt));
		}),

	summary: protectedProcedure
		.input(
			z.object({
				dateFrom: z.string().nullish(),
				dateTo: z.string().nullish(),
				status: z.enum(orderStatusEnum.enumValues).nullish(),
			})
		)
		.query(async ({ input }) => {
			const { dateFrom, dateTo, status } = input;
			const timezone = await getTimezone();

			let rangeStart: Date | undefined;
			let rangeEnd: Date | undefined;
			if (dateFrom) rangeStart = dayBoundsInTz(dateFrom, timezone).start;
			if (dateTo) rangeEnd = dayBoundsInTz(dateTo, timezone).end;

			const where = and(
				ne(orders.status, 'cancelled'),
				status ? eq(orders.status, status) : undefined,
				rangeStart ? gte(orders.createdAt, rangeStart) : undefined,
				rangeEnd ? lt(orders.createdAt, rangeEnd) : undefined
			);

			const [row] = await db
				.select({
					orderCount: count(),
					revenue: sql<string>`coalesce(sum(cast(${orders.total} as numeric)), 0)`,
					subtotalSum: sql<string>`coalesce(sum(cast(${orders.subtotal} as numeric)), 0)`,
					taxSum: sql<string>`coalesce(sum(cast(${orders.tax} as numeric)), 0)`,
					serviceSum: sql<string>`coalesce(sum(cast(${orders.serviceCharge} as numeric)), 0)`,
				})
				.from(orders)
				.where(where);

			return {
				orderCount: row.orderCount,
				revenue: Number(row.revenue),
				subtotalSum: Number(row.subtotalSum),
				taxSum: Number(row.taxSum),
				serviceSum: Number(row.serviceSum),
			};
		}),
});
