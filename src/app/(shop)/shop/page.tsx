import ShopView from '@/modules/shop/ui/views/shop-view';
import { ShopViewLoading } from '@/modules/shop/ui/views/shop-view-loading';
import { getQueryClient, trpc } from '@/trpc/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import { loadShopSearchParams } from '@/modules/shop/params';
import type { SearchParams } from 'nuqs';

interface Props {
	searchParams: Promise<SearchParams>;
}

const ShopPage = async ({ searchParams }: Props) => {
	const filters = await loadShopSearchParams(searchParams);
	const queryClient = getQueryClient();

	void queryClient.prefetchQuery(
		trpc.shop.getProducts.queryOptions({
			search: filters.search,
			page: filters.page,
			categorySlugs: filters.categorySlug ? [filters.categorySlug] : undefined,
			minPrice: filters.minPrice ?? undefined,
			maxPrice: filters.maxPrice ?? undefined,
		})
	);
	void queryClient.prefetchQuery(trpc.shop.getCategories.queryOptions());
	void queryClient.prefetchQuery(trpc.shop.getSettings.queryOptions());

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<Suspense fallback={<ShopViewLoading />}>
				<ShopView />
			</Suspense>
		</HydrationBoundary>
	);
};

export default ShopPage;
