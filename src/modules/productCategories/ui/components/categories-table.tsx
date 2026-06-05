'use client';

import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { columns } from './columns';
import EmptyState from '@/components/empty-state';
import { DataTable } from '@/components/data-table';
import DataPagination from './data-pagination';
import { useCategoriesFilters } from '../../hooks/use-categories-filter';
import { DEFAULT_PAGE_SIZE } from '@/constants';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export const CategoriesTable = () => {
	const router = useRouter();
	const trpc = useTRPC();
	const [filters, setFilters] = useCategoriesFilters();
	const { data } = useSuspenseQuery(trpc.categories.getMany.queryOptions({ ...filters }));

	return (
		<div className="flex flex-col gap-y-4">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<p className="text-sm text-muted-foreground">
					{data.total === 0
						? 'No categories found'
						: `${data.total} categor${data.total === 1 ? 'y' : 'ies'} found`}
				</p>
				<div className="flex items-center gap-x-2">
					<span className="hidden text-sm text-muted-foreground sm:inline">
						Rows per page
					</span>
					<Select
						value={String(filters.pageSize ?? DEFAULT_PAGE_SIZE)}
						onValueChange={(v) => setFilters({ pageSize: Number(v), page: 1 })}
					>
						<SelectTrigger size="sm" className="w-20 font-medium">
							<SelectValue />
						</SelectTrigger>
						<SelectContent align="end">
							{PAGE_SIZE_OPTIONS.map((s) => (
								<SelectItem key={s} value={String(s)}>
									{s}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

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
						onRowClick={(row) => router.push(`/admin/categories/${row.id}`)}
					/>
					<DataPagination
						page={filters.page}
						total={data.total}
						totalPages={data.totalPages}
						pageSize={filters.pageSize ?? DEFAULT_PAGE_SIZE}
						onPageChange={(page) => setFilters({ page })}
						onPageSizeChange={(pageSize) => setFilters({ pageSize, page: 1 })}
					/>
				</>
			)}
		</div>
	);
};
