'use client';
import { useTRPC } from '@/trpc/client';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Receipt from '@/modules/bill/ui/components/receipt';
import {
	SearchIcon,
	ReceiptIcon,
	ReceiptTextIcon,
	XIcon,
	Loader2Icon,
	HashIcon,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { OrderStatusBadge } from '@/modules/orders/ui/components/order-status-badge';
import { useCurrency } from '@/modules/company/hooks/use-currency';

const BillView = () => {
	const trpc = useTRPC();
	const { format: formatCurrency } = useCurrency();
	const [input, setInput] = useState('');
	const [searchId, setSearchId] = useState('');

	// Recent orders for quick pick
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

	const showReceipt = order && !isFetching;
	const showEmpty = !searchId && !isFetching;
	const showNotFound = (isError || order === null) && !isFetching && searchId;

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

					{/* Search bar */}
					<div className="flex items-center gap-2">
						<div className="relative w-72">
							<HashIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
							<Input
								value={input}
								onChange={(e) => setInput(e.target.value.toUpperCase())}
								onKeyDown={handleKeyDown}
								placeholder="Order ID (first 8 chars)..."
								className="h-9 rounded-full border-gray-200 pr-8 pl-9 font-mono text-sm uppercase shadow-none focus-visible:border-green-500 focus-visible:ring-0"
							/>
							{input && (
								<button
									onClick={handleClear}
									className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
								>
									<XIcon className="h-3.5 w-3.5" />
								</button>
							)}
						</div>
						<Button
							onClick={() => handleSearch()}
							disabled={!input.trim() || isFetching}
							className="h-9 rounded-full bg-green-600 px-5 text-sm font-semibold text-white hover:bg-green-700"
						>
							{isFetching ? (
								<Loader2Icon className="h-4 w-4 animate-spin" />
							) : (
								<>
									<SearchIcon className="mr-1.5 h-3.5 w-3.5" />
									Search
								</>
							)}
						</Button>
					</div>
				</div>
			</div>

			{/* Body */}
			<div className="flex flex-1 gap-6 bg-muted/40 p-6">
				{/* Left: recent orders quick-pick */}
				<div className="w-72 shrink-0">
					<p className="mb-3 text-xs font-semibold tracking-wider text-gray-400 uppercase">
						Recent Orders
					</p>
					<div className="flex flex-col gap-2">
						{!recent &&
							Array.from({ length: 6 }).map((_, i) => (
								<div
									key={i}
									className="h-16 animate-pulse rounded-xl bg-white/60"
								/>
							))}
						{recent?.items.map((o) => {
							const isSelected = searchId === o.id;
							return (
								<button
									key={o.id}
									onClick={() => handleSearch(o.id)}
									className={cn(
										'flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all duration-150',
										isSelected
											? 'border-green-600 bg-green-700 shadow-md'
											: 'border-gray-100 bg-white hover:border-green-300 hover:bg-green-50 hover:shadow-sm'
									)}
								>
									<div
										className={cn(
											'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors',
											isSelected ? 'bg-white/20' : 'bg-gray-100'
										)}
									>
										<ReceiptIcon
											className={cn(
												'h-4 w-4',
												isSelected ? 'text-white' : 'text-gray-500'
											)}
										/>
									</div>
									<div className="min-w-0 flex-1">
										<p
											className={cn(
												'font-mono text-xs font-bold',
												isSelected ? 'text-white' : 'text-gray-800'
											)}
										>
											#{o.id.slice(0, 8).toUpperCase()}
										</p>
										<p
											className={cn(
												'text-[10px]',
												isSelected ? 'text-green-200' : 'text-gray-400'
											)}
										>
											{format(new Date(o.createdAt), 'dd MMM, HH:mm')} ·{' '}
											{formatCurrency(o.total)}
										</p>
									</div>
									<OrderStatusBadge
										status={
											o.status as
												| 'pending'
												| 'processing'
												| 'completed'
												| 'cancelled'
										}
									/>
								</button>
							);
						})}
					</div>
				</div>

				{/* Right: receipt area */}
				<div className="flex flex-1 flex-col">
					{/* Spinner */}
					{isFetching && (
						<div className="flex flex-1 items-center justify-center">
							<Loader2Icon className="h-8 w-8 animate-spin text-green-600" />
						</div>
					)}

					{/* Empty */}
					{showEmpty && (
						<div className="flex flex-1 flex-col items-center justify-center gap-4">
							<div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-sm">
								<ReceiptIcon className="h-10 w-10 text-green-700" />
							</div>
							<div className="text-center">
								<p className="text-sm font-semibold text-gray-700">
									Select or search an order
								</p>
								<p className="mt-1 text-xs text-gray-400">
									Click a recent order on the left, or type the Order ID above
								</p>
							</div>
						</div>
					)}

					{/* Not found */}
					{showNotFound && (
						<div className="flex flex-1 flex-col items-center justify-center gap-3">
							<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
								<XIcon className="h-8 w-8 text-red-400" />
							</div>
							<div className="text-center">
								<p className="text-sm font-semibold text-gray-700">
									Order not found
								</p>
								<p className="mt-1 text-xs text-gray-400">
									No order starts with{' '}
									<span className="font-mono font-bold">
										#{searchId.toUpperCase()}
									</span>
								</p>
								<button
									onClick={handleClear}
									className="mt-2 text-xs text-green-600 hover:underline"
								>
									Clear and try again
								</button>
							</div>
						</div>
					)}

					{/* Receipt */}
					{showReceipt && (
						<div className="mx-auto w-full max-w-sm">
							<Receipt order={{ ...order, createdAt: new Date(order.createdAt) }} />
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default BillView;
