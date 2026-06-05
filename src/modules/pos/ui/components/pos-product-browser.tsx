'use client';

import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ScrollArea } from '@/components/ui/scroll-area';
import ProductSearch from './product-search';
import CategoryList from './category-list';
import ProductList from './product-list';
import PosPagination from './pos-pagination';
import EmptyState from '@/components/empty-state';
import { usePOSFilters } from '../../hooks/use-pos-filter';

export const PosProductBrowser = () => {
	const trpc = useTRPC();
	const [filters, setFilters] = usePOSFilters();

	const { data } = useSuspenseQuery(
		trpc.products.getMany.queryOptions({
			search: filters.search,
			page: filters.page,
			categorySlugs: filters.categorySlug ? [filters.categorySlug] : undefined,
		})
	);

	return (
		<div className="flex min-h-0 flex-1 flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
			<div className="flex items-center gap-3">
				<div className="flex-1">
					<ProductSearch />
				</div>
				<CategoryList />
				<span className="shrink-0 text-xs text-gray-400">
					{data.total} item{data.total !== 1 ? 's' : ''} found
				</span>
			</div>

			<ScrollArea className="min-h-0 flex-1">
				<div className="px-1 pt-1 pb-1">
					<ProductList data={data.items} />
					{data.items.length === 0 && (
						<EmptyState
							title="No Products Found"
							description="Try a different search or category"
						/>
					)}
				</div>
			</ScrollArea>

			{data.items.length !== 0 && data.totalPages > 1 && (
				<div className="border-t pt-3">
					<PosPagination
						page={filters.page}
						totalPages={data.totalPages}
						onPageChange={(page) => setFilters({ page })}
					/>
				</div>
			)}
		</div>
	);
};
