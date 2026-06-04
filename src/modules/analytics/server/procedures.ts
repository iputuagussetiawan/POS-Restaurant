import { db } from '@/db';
import { orders, orderItems, products, customers } from '@/db/schema';
import { createTRPCRouter, protectedProcedure } from '@/trpc/init';
import { and, desc, eq, gte, sql, ne, count } from 'drizzle-orm';

export const analyticsRouter = createTRPCRouter({
	summary: protectedProcedure.query(async () => {
		const now = new Date();
		const startOfToday = new Date(now);
		startOfToday.setHours(0, 0, 0, 0);
		const startOf30Days = new Date(now);
		startOf30Days.setDate(now.getDate() - 29);
		startOf30Days.setHours(0, 0, 0, 0);
		const startOfYesterday = new Date(startOfToday);
		startOfYesterday.setDate(startOfToday.getDate() - 1);

		const [todayStats] = await db
			.select({
				revenue: sql<string>`coalesce(sum(cast(${orders.total} as numeric)), 0)`,
				orderCount: count(),
			})
			.from(orders)
			.where(and(gte(orders.createdAt, startOfToday), ne(orders.status, 'cancelled')));

		const [yesterdayStats] = await db
			.select({
				revenue: sql<string>`coalesce(sum(cast(${orders.total} as numeric)), 0)`,
				orderCount: count(),
			})
			.from(orders)
			.where(
				and(
					gte(orders.createdAt, startOfYesterday),
					sql`${orders.createdAt} < ${startOfToday}`,
					ne(orders.status, 'cancelled')
				)
			);

		const [monthStats] = await db
			.select({
				revenue: sql<string>`coalesce(sum(cast(${orders.total} as numeric)), 0)`,
				orderCount: count(),
			})
			.from(orders)
			.where(and(gte(orders.createdAt, startOf30Days), ne(orders.status, 'cancelled')));

		const [totalCustomers] = await db.select({ count: count() }).from(customers);
		const [totalProducts] = await db.select({ count: count() }).from(products);

		return {
			today: {
				revenue: Number(todayStats.revenue),
				orderCount: todayStats.orderCount,
			},
			yesterday: {
				revenue: Number(yesterdayStats.revenue),
				orderCount: yesterdayStats.orderCount,
			},
			month: {
				revenue: Number(monthStats.revenue),
				orderCount: monthStats.orderCount,
			},
			totalCustomers: totalCustomers.count,
			totalProducts: totalProducts.count,
		};
	}),

	revenueByDay: protectedProcedure.query(async () => {
		const start = new Date();
		start.setDate(start.getDate() - 29);
		start.setHours(0, 0, 0, 0);

		const rows = await db
			.select({
				date: sql<string>`to_char(${orders.createdAt}, 'YYYY-MM-DD')`,
				revenue: sql<string>`coalesce(sum(cast(${orders.total} as numeric)), 0)`,
				orderCount: count(),
			})
			.from(orders)
			.where(and(gte(orders.createdAt, start), ne(orders.status, 'cancelled')))
			.groupBy(sql`to_char(${orders.createdAt}, 'YYYY-MM-DD')`)
			.orderBy(sql`to_char(${orders.createdAt}, 'YYYY-MM-DD')`);

		// Fill gaps with 0
		const map = new Map(rows.map((r) => [r.date, r]));
		const result = [];
		for (let i = 29; i >= 0; i--) {
			const d = new Date();
			d.setDate(d.getDate() - i);
			const key = d.toISOString().split('T')[0];
			const row = map.get(key);
			result.push({
				date: key,
				revenue: Number(row?.revenue ?? 0),
				orderCount: Number(row?.orderCount ?? 0),
			});
		}
		return result;
	}),

	topProducts: protectedProcedure.query(async () => {
		return db
			.select({
				name: orderItems.name,
				totalQty: sql<number>`cast(sum(${orderItems.quantity}) as int)`,
				totalRevenue: sql<string>`coalesce(sum(cast(${orderItems.subtotal} as numeric)), 0)`,
			})
			.from(orderItems)
			.innerJoin(orders, eq(orderItems.orderId, orders.id))
			.where(ne(orders.status, 'cancelled'))
			.groupBy(orderItems.name)
			.orderBy(desc(sql`sum(${orderItems.quantity})`))
			.limit(8);
	}),

	paymentMethodBreakdown: protectedProcedure.query(async () => {
		return db
			.select({
				method: orders.paymentMethod,
				count: count(),
				revenue: sql<string>`coalesce(sum(cast(${orders.total} as numeric)), 0)`,
			})
			.from(orders)
			.where(ne(orders.status, 'cancelled'))
			.groupBy(orders.paymentMethod);
	}),

	orderStatusBreakdown: protectedProcedure.query(async () => {
		return db
			.select({
				status: orders.status,
				count: count(),
			})
			.from(orders)
			.groupBy(orders.status);
	}),

	recentOrders: protectedProcedure.query(async () => {
		return db
			.select({
				id: orders.id,
				total: orders.total,
				status: orders.status,
				paymentMethod: orders.paymentMethod,
				customerName: orders.customerName,
				createdAt: orders.createdAt,
			})
			.from(orders)
			.orderBy(desc(orders.createdAt))
			.limit(6);
	}),
});
