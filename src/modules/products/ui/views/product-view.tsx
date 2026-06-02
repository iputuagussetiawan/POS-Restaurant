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
import EmptyState from '@/components/empty-state';
import DataPagination from '../components/data-pagination';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/data-table';
import { useProductsFilters } from '../../hooks/use-products-filter';
import { columns } from '../components/columns';
import { DEFAULT_PAGE_SIZE } from '../../../../../constants';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export const ProductView = () => {
	const router = useRouter();
	const [filters, setFilters] = useProductsFilters();
	const trpc = useTRPC();
	const { data } = useSuspenseQuery(trpc.products.getMany.queryOptions({ ...filters }));

	return (
		<div className="flex flex-col gap-y-4 px-4 py-4 md:px-8">
			<div className="flex items-center justify-between gap-x-4">
				<p className="text-sm text-muted-foreground">
					{data.total === 0
						? 'No products found'
						: `${data.total} product${data.total === 1 ? '' : 's'} found`}
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
						onPageSizeChange={(pageSize) => setFilters({ pageSize, page: 1 })}
					/>
				</>
			)}
		</div>
	);
};

export const ProductViewLoading = () => (
	<div className="flex flex-col gap-y-4 px-4 py-4 md:px-8">
		<Skeleton className="h-4 w-36" />
		<div className="overflow-hidden rounded-lg border bg-white">
			<Table>
				<TableHeader>
					<TableRow className="bg-muted/40 hover:bg-muted/40">
						<TableHead className="px-4 py-3">
							<Skeleton className="h-4 w-28" />
						</TableHead>
						<TableHead className="px-4 py-3">
							<Skeleton className="h-4 w-20" />
						</TableHead>
						<TableHead className="px-4 py-3">
							<Skeleton className="h-4 w-16" />
						</TableHead>
						<TableHead className="px-4 py-3">
							<Skeleton className="h-4 w-16" />
						</TableHead>
						<TableHead className="px-4 py-3">
							<Skeleton className="h-4 w-20" />
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{Array.from({ length: 8 }).map((_, i) => (
						<TableRow key={i}>
							<TableCell className="px-4 py-3">
								<div className="flex items-center gap-x-3">
									<Skeleton className="size-10 shrink-0 rounded-lg" />
									<div className="flex flex-col gap-y-1">
										<Skeleton className="h-4 w-36" />
										<Skeleton className="h-3 w-24" />
									</div>
								</div>
							</TableCell>
							<TableCell className="px-4 py-3">
								<Skeleton className="h-5 w-24 rounded-full" />
							</TableCell>
							<TableCell className="px-4 py-3">
								<Skeleton className="h-4 w-14" />
							</TableCell>
							<TableCell className="px-4 py-3">
								<Skeleton className="h-5 w-20 rounded-full" />
							</TableCell>
							<TableCell className="px-4 py-3">
								<Skeleton className="h-4 w-24" />
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

export const ProductViewError = () => (
	<ErrorState title="Error loading products" description="Please try again later." />
);
