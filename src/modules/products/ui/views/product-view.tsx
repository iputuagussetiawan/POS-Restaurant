'use client';

import ErrorState from '@/components/error-state';
import LoadingState from '@/components/loading-state';
import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery } from '@tanstack/react-query';
import EmptyState from '@/components/empty-state';
import DataPagination from '../components/data-pagination';
import { useRouter } from 'next/navigation';
import { useProductsFilters } from '../../hooks/use-products-filter';
import ProductCard from '../components/product-card';

export const ProductView = () => {
	const router = useRouter();
	const [filters, setFilters] = useProductsFilters();
	const trpc = useTRPC();
	const { data } = useSuspenseQuery(trpc.products.getMany.queryOptions({ ...filters }));

	if (data.items.length === 0) {
		return (
			<div className="flex flex-1 flex-col gap-y-4 px-4 pb-4 md:px-8">
				<EmptyState
					title="No products found"
					description="Try adjusting your filters or create a new product."
				/>
			</div>
		);
	}

	return (
		<div className="flex flex-1 flex-col gap-y-4 px-4 pb-4 md:px-8">
			<div className="text-sm text-muted-foreground">
				{data.total} {data.total === 1 ? 'product' : 'products'} found
			</div>
			<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
				{data.items.map((product) => (
					<ProductCard
						key={product.id}
						product={product}
						onClick={() => router.push(`/products/${product.id}`)}
					/>
				))}
			</div>
			<DataPagination
				page={filters.page}
				total={data.total}
				totalPages={data.totalPages}
				pageSize={filters.pageSize ?? 10}
				onPageChange={(page) => setFilters({ page })}
			/>
		</div>
	);
};

export const ProductViewLoading = () => {
	return <LoadingState title="Loading products" description="Please wait..." />;
};

export const ProductViewError = () => {
	return <ErrorState title="Error loading products" description="Please try again later." />;
};
