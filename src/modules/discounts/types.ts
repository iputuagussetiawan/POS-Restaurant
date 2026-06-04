import { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '@/trpc/routers/_app';

export type DiscountsGetOne = inferRouterOutputs<AppRouter>['discounts']['getOne'];
export type DiscountsGetMany = inferRouterOutputs<AppRouter>['discounts']['getMany']['items'];
