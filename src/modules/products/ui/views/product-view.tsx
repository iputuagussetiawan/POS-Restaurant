'use client';

import ErrorState from '@/components/error-state';
import LoadingState from '@/components/loading-state';
import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery } from '@tanstack/react-query';
import EmptyState from '@/components/empty-state';
import DataPagination from '../components/data-pagination';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/data-table';
import { useProductsFilters } from '../../hooks/use-products-filter';
import { columns } from '../components/columns';
import { DEFAULT_PAGE_SIZE } from '../../../../../constants';

export const ProductView = () => {
	const router = useRouter();
	const [filters, setFilters] = useProductsFilters();
	const trpc = useTRPC();
	const { data } = useSuspenseQuery(trpc.products.getMany.queryOptions({ ...filters }));

	return (
		<div className="flex flex-1 flex-col gap-y-4 px-4 pb-4 md:px-8">
			{data.items.length === 0 ? (
				<EmptyState
					title="No products found"
					description="Try adjusting your filters or create a new product."
				/>
			) : (
				<>
					<DataTable
						data={data.items}
						columns={columns}
						onRowClick={(row) => router.push(`/products/${row.id}`)}
					/>
					<DataPagination
						page={filters.page}
						total={data.total}
						totalPages={data.totalPages}
						pageSize={filters.pageSize ?? DEFAULT_PAGE_SIZE}
						onPageChange={(page) => setFilters({ page })}
					/>
				</>
			)}
		</div>
	);
};

export const ProductViewLoading = () => (
	<LoadingState title="Loading products" description="Please wait..." />
);

export const ProductViewError = () => (
	<ErrorState title="Error loading products" description="Please try again later." />
);
