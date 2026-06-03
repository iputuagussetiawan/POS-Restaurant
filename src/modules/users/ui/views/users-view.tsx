'use client';

import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery } from '@tanstack/react-query';
import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorState from '@/components/error-state';
import EmptyState from '@/components/empty-state';
import LoadingState from '@/components/loading-state';
import { DataTable } from '@/components/data-table';
import { columns } from '../components/columns';
import UsersListHeader from '../components/users-list-header';
import { useUsersFilters } from '../../hooks/use-users-filter';
import DataPagination from '@/modules/products/ui/components/data-pagination';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { DEFAULT_PAGE_SIZE } from '../../../../../constants';
import { Skeleton } from '@/components/ui/skeleton';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const UsersTable = () => {
	const trpc = useTRPC();
	const [filters, setFilters] = useUsersFilters();

	const { data } = useSuspenseQuery(
		trpc.users.getAll.queryOptions({
			page: filters.page,
			pageSize: filters.pageSize,
			search: filters.search || undefined,
			role: filters.role ?? undefined,
			status: filters.status ?? undefined,
		})
	);

	return (
		<div className="flex flex-col gap-y-4 px-4 py-4 pb-8 md:px-8">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<p className="text-sm text-muted-foreground">
					{data.total === 0
						? 'No users found'
						: `${data.total} user${data.total === 1 ? '' : 's'} found`}
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
				<EmptyState title="No users found" description="Try adjusting your search." />
			) : (
				<>
					<DataTable data={data.items} columns={columns} />
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

export const UsersViewLoading = () => (
	<div className="flex flex-col gap-y-4 px-4 py-4 md:px-8">
		<Skeleton className="h-4 w-36" />
		<div className="overflow-hidden rounded-lg border bg-white">
			<Table>
				<TableHeader>
					<TableRow className="bg-muted/40 hover:bg-muted/40">
						{['Name', 'Role', 'Status', 'Joined', ''].map((h) => (
							<TableHead key={h} className="px-4 py-3">
								<Skeleton className="h-4 w-20" />
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{Array.from({ length: 8 }).map((_, i) => (
						<TableRow key={i}>
							<TableCell className="px-4 py-3">
								<div className="flex flex-col gap-y-1">
									<Skeleton className="h-4 w-32" />
									<Skeleton className="h-3 w-44" />
								</div>
							</TableCell>
							<TableCell className="px-4 py-3">
								<Skeleton className="h-6 w-24 rounded-full" />
							</TableCell>
							<TableCell className="px-4 py-3">
								<Skeleton className="h-5 w-16 rounded-full" />
							</TableCell>
							<TableCell className="px-4 py-3">
								<Skeleton className="h-4 w-24" />
							</TableCell>
							<TableCell className="px-4 py-3">
								<Skeleton className="h-8 w-8 rounded-md" />
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	</div>
);

const UsersView = () => {
	return (
		<div className="flex flex-1 flex-col">
			<UsersListHeader />
			<ErrorBoundary
				fallback={
					<ErrorState title="Error loading users" description="Please try again later." />
				}
			>
				<Suspense fallback={<UsersViewLoading />}>
					<UsersTable />
				</Suspense>
			</ErrorBoundary>
		</div>
	);
};

export default UsersView;
