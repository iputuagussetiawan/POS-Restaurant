import { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '@/trpc/routers/_app';

export type ProductGetOne = inferRouterOutputs<AppRouter>['products']['getOne'];
export type ProductGetMany = inferRouterOutputs<AppRouter>['products']['getMany']['items'];
