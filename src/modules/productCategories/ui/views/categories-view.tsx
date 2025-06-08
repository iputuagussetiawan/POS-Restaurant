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

export const CategoriesView = () => {
	const router = useRouter();
	const [filters, setFilters] = useCategoriesFilters();
	const trpc = useTRPC();
	const { data } = useSuspenseQuery(
		trpc.categories.getMany.queryOptions({
			...filters,
		})
	);

	return (
		<div className="flex flex-1 flex-col gap-y-4 px-4 pb-4 md:px-8">
			<DataTable
				data={data.items}
				columns={columns}
				onRowClick={(row) => router.push(`/categories/${row.id}`)}
			/>
			<DataPagination
				page={filters.page}
				totalPages={data.totalPages}
				onPageChange={(page) => setFilters({ page })}
			/>
			{data.items.length == 0 && (
				<EmptyState
					title="Create your first category"
					description="Create a category to join your meeting. Each category will follow yor instructions and can interact with participants during the meeting."
				/>
			)}
		</div>
	);
};

export const CategoriesViewLoading = () => {
	return <LoadingState title="Loading categories" description="Please wait..." />;
};

export const CategoriesViewError = () => {
	return <ErrorState title="Error loading categories" description="Please try again later." />;
};
