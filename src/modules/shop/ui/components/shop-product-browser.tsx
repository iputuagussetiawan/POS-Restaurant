'use client';

import { useTRPC } from '@/trpc/client';
import { useQuery } from '@tanstack/react-query';
import PosPagination from '@/modules/pos/ui/components/pos-pagination';
import EmptyState from '@/components/empty-state';
import {
	useShopFilters,
	SHOP_SORT_OPTIONS,
	SHOP_PAGE_SIZE_OPTIONS,
} from '../../hooks/use-shop-filter';
import ShopProductList from './shop-product-list';
import { ShopSidebar, ShopFilterButton } from './shop-sidebar';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

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
			pageSize: filters.pageSize,
			categorySlugs: filters.categorySlug ? [filters.categorySlug] : undefined,
			minPrice: filters.minPrice ?? undefined,
			maxPrice: filters.maxPrice ?? undefined,
			sort: filters.sort,
		})
	);

	return (
		<div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-6 md:px-6">
			{/* Left sidebar — desktop */}
			<ShopSidebar />

			{/* Main content */}
			<div className="flex min-w-0 flex-1 flex-col gap-4">
				{/* Sort / per-page bar */}
				<div className="flex flex-wrap items-center justify-between gap-2">
					{/* Left: mobile filter + count */}
					<div className="flex items-center gap-2">
						<ShopFilterButton />
						<span className="text-sm text-gray-400">
							{data ? (
								<>
									<span className="font-medium text-gray-700">{data.total}</span>{' '}
									product{data.total !== 1 ? 's' : ''} found
								</>
							) : (
								<span className="inline-block h-4 w-20 animate-pulse rounded bg-gray-200" />
							)}
						</span>
					</div>

					{/* Right: per-page + sort */}
					<div className="flex items-center gap-2">
						{/* Per page */}
						<div className="flex items-center gap-1.5">
							<span className="hidden text-xs text-gray-400 sm:block">Show</span>
							<Select
								value={String(filters.pageSize)}
								onValueChange={(val) =>
									setFilters({ pageSize: Number(val), page: 1 })
								}
							>
								<SelectTrigger className="h-9 w-20 border-gray-200 bg-white text-sm shadow-none focus:ring-0">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{SHOP_PAGE_SIZE_OPTIONS.map((n) => (
										<SelectItem key={n} value={String(n)}>
											{n}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<span className="hidden text-xs text-gray-400 sm:block">/ page</span>
						</div>

						<div className="h-5 w-px bg-gray-200" />

						{/* Sort */}
						<Select
							value={filters.sort}
							onValueChange={(val) =>
								setFilters({ sort: val as typeof filters.sort, page: 1 })
							}
						>
							<SelectTrigger className="h-9 w-44 border-gray-200 bg-white text-sm shadow-none focus:ring-0">
								<SelectValue placeholder="Sort by" />
							</SelectTrigger>
							<SelectContent align="end">
								{SHOP_SORT_OPTIONS.map((opt) => (
									<SelectItem key={opt.value} value={opt.value}>
										{opt.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				{/* Products */}
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
						{Array.from({ length: filters.pageSize }).map((_, i) => (
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
