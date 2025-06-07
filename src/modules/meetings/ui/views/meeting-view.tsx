'use client';
import ErrorState from '@/components/error-state';
import LoadingState from '@/components/loading-state';
import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery } from '@tanstack/react-query';
import React from 'react';
import { columns } from '../components/columns';
import EmptyState from '@/components/empty-state';
import { DataTable } from '@/components/data-table';
import { useRouter } from 'next/navigation';
import { useMeetingsFilters } from '../../hooks/use-meetings-filter';
import DataPagination from '@/components/data-pagination';

const MeetingView = () => {
	const trpc = useTRPC();
	const router = useRouter();
	const [filters, setFilters] = useMeetingsFilters();
	const { data } = useSuspenseQuery(
		trpc.meetings.getMany.queryOptions({
			...filters,
		})
	);
	return (
		<div className="flex flex-1 flex-col gap-y-4 px-4 pb-4 md:px-8">
			<DataTable
				data={data.items}
				columns={columns}
				onRowClick={(row) => router.push(`/meetings/${row.id}`)}
			/>
			<DataPagination
				page={filters.page}
				totalPages={data.totalPages}
				onPageChange={(page) => setFilters({ page })}
			/>
			{data.items.length == 0 && (
				<EmptyState
					title="Create your first meeting"
					description="Create a meeting to join your participants during the meeting."
				/>
			)}
		</div>
	);
};

export default MeetingView;

export const MeetingViewLoading = () => {
	return <LoadingState title="Loading meetings" description="Please wait..." />;
};

export const MeetingViewError = () => {
	return <ErrorState title="Error loading meetings" description="Please try again later." />;
};
