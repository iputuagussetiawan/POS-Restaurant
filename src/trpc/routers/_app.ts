import { createTRPCRouter } from '../init';
import { productsRouter } from '@/modules/products/server/procedures';
import { shopRouter } from '@/modules/shop/server/procedures';
import { categoriesRouter } from '@/modules/productCategories/server/procedures';
import { usersRouter } from '@/modules/users/server/procedures';
import { profileRouter } from '@/modules/profile/server/procedures';
import { ordersRouter } from '@/modules/orders/server/procedures';
import { customersRouter } from '@/modules/customers/server/procedures';
import { analyticsRouter } from '@/modules/analytics/server/procedures';
import { companyRouter } from '@/modules/company/server/procedures';
import { historyRouter } from '@/modules/history/server/procedures';
import { discountsRouter } from '@/modules/discounts/server/procedures';

export const appRouter = createTRPCRouter({
	shop: shopRouter,
	analytics: analyticsRouter,
	history: historyRouter,
	categories: categoriesRouter,
	products: productsRouter,
	users: usersRouter,
	profile: profileRouter,
	orders: ordersRouter,
	customers: customersRouter,
	company: companyRouter,
	discounts: discountsRouter,
});

export type AppRouter = typeof appRouter;
