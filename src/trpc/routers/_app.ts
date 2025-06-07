import { agentsRouter } from '@/modules/agents/server/procedures';
import { meetingsRouter } from '@/modules/meetings/server/procedures';
import { createTRPCRouter } from '../init';
import { productsRouter } from '@/modules/products/server/procedures';
import { categoriesRouter } from '@/modules/productCategories/server/procedures';

export const appRouter = createTRPCRouter({
	agents: agentsRouter,
	meetings: meetingsRouter,
	categories: categoriesRouter,
	products: productsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
