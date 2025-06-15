import { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '@/trpc/routers/_app';

export type POSGetOne = inferRouterOutputs<AppRouter>['products']['getOne'];
export type POSGetMany = inferRouterOutputs<AppRouter>['products']['getMany']['items'];
