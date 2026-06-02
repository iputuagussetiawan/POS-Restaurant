'use client';

import ErrorState from '@/components/error-state';
import LoadingState from '@/components/loading-state';
import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { columns } from '../components/columns';
import EmptyState from '@/components/empty-state';
import { useCategoriesFilters } from '../../hooks/use-categories-filter';
import DataPagination from '../components/data-pagination';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/data-table';
import { DEFAULT_PAGE_SIZE } from '../../../../../constants';

export const CategoriesView = () => {
	const router = useRouter();
	const [filters, setFilters] = useCategoriesFilters();
	const trpc = useTRPC();
	const { data } = useSuspenseQuery(trpc.categories.getMany.queryOptions({ ...filters }));

	return (
		<div className="flex flex-1 flex-col gap-y-4 px-4 pb-4 md:px-8">
			{data.items.length === 0 ? (
				<EmptyState
					title="No categories found"
					description="Try adjusting your search or create a new category."
				/>
			) : (
				<>
					<DataTable
						data={data.items}
						columns={columns}
						onRowClick={(row) => router.push(`/categories/${row.id}`)}
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

export const CategoriesViewLoading = () => (
	<LoadingState title="Loading categories" description="Please wait..." />
);

export const CategoriesViewError = () => (
	<ErrorState title="Error loading categories" description="Please try again later." />
);
