'use client';

import ErrorState from '@/components/error-state';
import LoadingState from '@/components/loading-state';
import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { columns } from '../components/columns';
import EmptyState from '@/components/empty-state';
import { useAgentsFilters } from '../../hooks/use-agents-filter';
import DataPagination from '../components/data-pagination';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/data-table';

export const AgentsView = () => {
	const router = useRouter();
	const [filters, setFilters] = useAgentsFilters();
	const trpc = useTRPC();
	const { data } = useSuspenseQuery(
		trpc.agents.getMany.queryOptions({
			...filters,
		})
	);

	return (
		<div className="flex flex-1 flex-col gap-y-4 px-4 pb-4 md:px-8">
			<DataTable
				data={data.items}
				columns={columns}
				onRowClick={(row) => router.push(`/agents/${row.id}`)}
			/>
			<DataPagination
				page={filters.page}
				totalPages={data.totalPages}
				onPageChange={(page) => setFilters({ page })}
			/>
			{data.items.length == 0 && (
				<EmptyState
					title="Create your first agent"
					description="Create an agent to join your meeting. Each agent will follow yor instructions and can interact with participants during the meeting."
				/>
			)}
		</div>
	);
};

export const AgentViewLoading = () => {
	return <LoadingState title="Loading agents" description="Please wait..." />;
};

export const AgentViewError = () => {
	return <ErrorState title="Error loading agents" description="Please try again later." />;
};
