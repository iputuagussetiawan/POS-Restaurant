import { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '@/trpc/routers/_app';

export type ShopProduct = inferRouterOutputs<AppRouter>['shop']['getProducts']['items'][number];
export type ShopCategory = inferRouterOutputs<AppRouter>['shop']['getCategories']['items'][number];
export type ShopSettings = inferRouterOutputs<AppRouter>['shop']['getSettings'];
