'use client';

import { useTRPC } from '@/trpc/client';
import { useQuery } from '@tanstack/react-query';
import PosPagination from '@/modules/pos/ui/components/pos-pagination';
import EmptyState from '@/components/empty-state';
import { useShopFilters } from '../../hooks/use-shop-filter';
import ShopSearch from './shop-search';
import ShopProductList from './shop-product-list';
import { ShopSidebar, ShopFilterButton } from './shop-sidebar';

export const ShopProductBrowser = () => {
	const trpc = useTRPC();
	const [filters, setFilters] = useShopFilters();

	const { data: settings } = useQuery(trpc.shop.getSettings.queryOptions());
	const taxRate = Number(settings?.taxRate ?? 0) / 100;
	const serviceRate = Number(settings?.serviceRate ?? 0) / 100;

	const { data } = useQuery(
		trpc.shop.getProducts.queryOptions({
			search: filters.search,
			page: filters.page,
			categorySlugs: filters.categorySlug ? [filters.categorySlug] : undefined,
			minPrice: filters.minPrice ?? undefined,
			maxPrice: filters.maxPrice ?? undefined,
		})
	);

	return (
		<div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-6 md:px-6">
			{/* Left sidebar — desktop */}
			<ShopSidebar />

			{/* Main content */}
			<div className="min-w-0 flex-1">
				{data ? (
					<>
						{data.items.length === 0 ? (
							<EmptyState
								title="No Products Found"
								description="Try adjusting your search or filters"
							/>
						) : (
							<ShopProductList
								data={data.items}
								taxRate={taxRate}
								serviceRate={serviceRate}
							/>
						)}
						{data.items.length > 0 && data.totalPages > 1 && (
							<div className="mt-8 flex justify-center">
								<PosPagination
									page={filters.page}
									totalPages={data.totalPages}
									onPageChange={(page) => setFilters({ page })}
								/>
							</div>
						)}
					</>
				) : (
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-3 xl:grid-cols-4">
						{Array.from({ length: 8 }).map((_, i) => (
							<div
								key={i}
								className="aspect-[3/4] animate-pulse rounded-2xl bg-gray-200"
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export const ShopToolbar = () => {
	const trpc = useTRPC();
	const [filters] = useShopFilters();

	const { data } = useQuery(
		trpc.shop.getProducts.queryOptions({
			search: filters.search,
			page: filters.page,
			categorySlugs: filters.categorySlug ? [filters.categorySlug] : undefined,
			minPrice: filters.minPrice ?? undefined,
			maxPrice: filters.maxPrice ?? undefined,
		})
	);

	return (
		<div className="sticky top-14 z-20 border-b bg-white/90 px-4 py-3 shadow-sm backdrop-blur-md md:px-6">
			<div className="mx-auto flex max-w-7xl items-center gap-3">
				{/* Mobile filter button */}
				<ShopFilterButton />

				{/* Search */}
				<div className="flex-1">
					<ShopSearch />
				</div>

				{/* Result count */}
				<span className="hidden shrink-0 text-xs text-gray-400 sm:block">
					{data?.total ?? '—'} item{data?.total !== 1 ? 's' : ''}
				</span>
			</div>
		</div>
	);
};
