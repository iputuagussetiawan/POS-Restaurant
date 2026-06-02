'use client';

import ErrorState from '@/components/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { columns } from '../components/columns';
import EmptyState from '@/components/empty-state';
import { useCategoriesFilters } from '../../hooks/use-categories-filter';
import DataPagination from '../components/data-pagination';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/data-table';
import { DEFAULT_PAGE_SIZE } from '../../../../../constants';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export const CategoriesView = () => {
	const router = useRouter();
	const [filters, setFilters] = useCategoriesFilters();
	const trpc = useTRPC();
	const { data } = useSuspenseQuery(trpc.categories.getMany.queryOptions({ ...filters }));

	return (
		<div className="flex flex-col gap-y-4 px-4 py-4 md:px-8">
			<div className="flex items-center justify-between gap-x-4">
				<p className="text-sm text-muted-foreground">
					{data.total === 0
						? 'No categories found'
						: `${data.total} categor${data.total === 1 ? 'y' : 'ies'} found`}
				</p>
				<div className="flex items-center gap-x-2">
					<span className="text-sm whitespace-nowrap text-muted-foreground">
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
						onRowClick={(row) => router.push(`/categories/${row.id}`)}
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

export const CategoriesViewLoading = () => (
	<div className="flex flex-col gap-y-4 px-4 py-4 md:px-8">
		<Skeleton className="h-4 w-36" />
		<div className="overflow-hidden rounded-lg border bg-white">
			<Table>
				<TableHeader>
					<TableRow className="bg-muted/40 hover:bg-muted/40">
						<TableHead className="px-4 py-3">
							<Skeleton className="h-4 w-32" />
						</TableHead>
						<TableHead className="px-4 py-3">
							<Skeleton className="h-4 w-40" />
						</TableHead>
						<TableHead className="px-4 py-3">
							<Skeleton className="h-4 w-24" />
						</TableHead>
						<TableHead className="px-4 py-3">
							<Skeleton className="h-4 w-20" />
						</TableHead>
						<TableHead className="px-4 py-3" />
					</TableRow>
				</TableHeader>
				<TableBody>
					{Array.from({ length: 8 }).map((_, i) => (
						<TableRow key={i}>
							<TableCell className="px-4 py-3">
								<div className="flex items-center gap-x-3">
									<Skeleton className="size-11 shrink-0 rounded-lg" />
									<Skeleton className="h-4 w-32" />
								</div>
							</TableCell>
							<TableCell className="px-4 py-3">
								<Skeleton className="h-4 w-64" />
							</TableCell>
							<TableCell className="px-4 py-3">
								<Skeleton className="h-4 w-24" />
							</TableCell>
							<TableCell className="px-4 py-3">
								<Skeleton className="h-4 w-20" />
							</TableCell>
							<TableCell className="px-4 py-3">
								<Skeleton className="size-8 rounded-md" />
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
		<div className="flex items-center justify-between">
			<Skeleton className="h-4 w-32" />
			<div className="flex gap-x-2">
				<Skeleton className="h-8 w-8 rounded-md" />
				<Skeleton className="h-8 w-8 rounded-md" />
				<Skeleton className="h-8 w-8 rounded-md" />
			</div>
		</div>
	</div>
);

export const CategoriesViewError = () => (
	<ErrorState title="Error loading categories" description="Please try again later." />
);
