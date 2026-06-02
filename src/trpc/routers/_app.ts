import { createTRPCRouter } from '../init';
import { productsRouter } from '@/modules/products/server/procedures';
import { categoriesRouter } from '@/modules/productCategories/server/procedures';
import { usersRouter } from '@/modules/users/server/procedures';
import { profileRouter } from '@/modules/profile/server/procedures';

export const appRouter = createTRPCRouter({
	categories: categoriesRouter,
	products: productsRouter,
	users: usersRouter,
	profile: profileRouter,
});

export type AppRouter = typeof appRouter;
