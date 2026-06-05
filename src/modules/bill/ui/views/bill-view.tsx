'use client';

import { useTRPC } from '@/trpc/client';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ReceiptTextIcon } from 'lucide-react';
import { BillSearchBar } from '../components/bill-search-bar';
import { BillRecentOrders } from '../components/bill-recent-orders';
import { BillReceiptArea } from '../components/bill-receipt-area';

const BillView = () => {
	const trpc = useTRPC();
	const [input, setInput] = useState('');
	const [searchId, setSearchId] = useState('');

	const { data: recent } = useQuery(trpc.orders.getMany.queryOptions({ pageSize: 8 }));

	const {
		data: order,
		isFetching,
		isError,
	} = useQuery({
		...trpc.orders.getOne.queryOptions({ id: searchId }),
		enabled: searchId.length > 0,
		retry: false,
	});

	const handleSearch = (id?: string) => {
		const trimmed = (id ?? input).trim();
		if (trimmed) {
			setSearchId(trimmed);
			if (!id) setInput('');
		}
	};

	const handleClear = () => {
		setInput('');
		setSearchId('');
	};
	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') handleSearch();
	};

	return (
		<div className="flex flex-1 flex-col">
			{/* Header */}
			<div className="border-b bg-white px-6 py-4">
				<div className="flex items-center justify-between gap-4">
					<div className="flex shrink-0 items-center gap-3">
						<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-700">
							<ReceiptTextIcon className="h-5 w-5 text-white" />
						</div>
						<div>
							<h1 className="text-base font-semibold text-gray-900">Bill</h1>
							<p className="text-xs text-gray-400">
								Search by order ID to view & print receipt
							</p>
						</div>
					</div>
					<BillSearchBar
						input={input}
						isFetching={isFetching}
						onChange={setInput}
						onSearch={() => handleSearch()}
						onClear={handleClear}
						onKeyDown={handleKeyDown}
					/>
				</div>
			</div>

			{/* Body */}
			<div className="flex flex-1 gap-6 bg-muted/40 p-6">
				<BillRecentOrders
					orders={recent?.items}
					selectedId={searchId}
					onSelect={(id) => handleSearch(id)}
				/>
				<BillReceiptArea
					isFetching={isFetching}
					showEmpty={!searchId && !isFetching}
					showNotFound={!!(isError || order === null) && !isFetching && !!searchId}
					showReceipt={!!(order && !isFetching)}
					order={order}
					searchId={searchId}
					onClear={handleClear}
				/>
			</div>
		</div>
	);
};

export default BillView;
