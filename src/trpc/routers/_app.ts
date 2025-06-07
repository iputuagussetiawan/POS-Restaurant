import { agentsRouter } from '@/modules/agents/server/procedures';
import { meetingsRouter } from '@/modules/meetings/server/procedures';
import { createTRPCRouter } from '../init';
import { productsRouter } from '@/modules/products/server/procedures';
export const appRouter = createTRPCRouter({
	agents: agentsRouter,
	meetings: meetingsRouter,
	products: productsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
