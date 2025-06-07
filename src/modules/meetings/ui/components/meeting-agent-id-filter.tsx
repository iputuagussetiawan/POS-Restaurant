import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';
import { CommandSelect } from '@/components/command-select';
import { useMeetingsFilters } from '../../hooks/use-meetings-filter';

import React from 'react';
import GenerateAvatar from '@/components/generate-avatar';

const AgentIdFilter = () => {
	const [filters, setFilters] = useMeetingsFilters();
	const trpc = useTRPC();
	const [agentSearch, setAgentSearch] = useState('');
	const { data } = useQuery(
		trpc.agents.getMany.queryOptions({
			pageSize: 100,
			search: agentSearch,
		})
	);
	return (
		<CommandSelect
			className="h-9"
			placeholder="Filter by agent..."
			options={(data?.items ?? []).map((agent) => ({
				id: agent.id,
				value: agent.id,
				children: (
					<div className="flex items-center gap-x-2">
						<GenerateAvatar
							seed={agent.name}
							variant="botttsNeutral"
							className="size-4"
						/>
						<span>{agent.name}</span>
					</div>
				),
			}))}
			onSelect={(value) => setFilters({ agentId: value })}
			onSearch={setAgentSearch}
			value={filters.agentId ?? ''}
		/>
	);
};

export default AgentIdFilter;
