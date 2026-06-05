'use client';

import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery } from '@tanstack/react-query';
import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorState from '@/components/error-state';
import EmptyState from '@/components/empty-state';
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
import { UsersViewLoading } from './users-view-loading';

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
