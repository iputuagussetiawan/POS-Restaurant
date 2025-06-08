import { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '@/trpc/routers/_app';

export type CategoriesGetOne = inferRouterOutputs<AppRouter>['categories']['getOne'];
export type CategoriesGetMany = inferRouterOutputs<AppRouter>['categories']['getMany']['items'];
