'use client';

import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Suspense, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorState from '@/components/error-state';
import { useOrdersFilters } from '@/modules/orders/hooks/use-orders-filter';
import { OrdersViewLoading } from './orders-view-loading';
import OrderListHeader from '@/modules/orders/ui/components/order-list-header';
import PosPagination from '@/modules/pos/ui/components/pos-pagination';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ClipboardListIcon } from 'lucide-react';
import { toast } from 'sonner';
import { OrderCard } from '../components/order-card';
import { OrderRow } from '../components/order-row';
import { OrderStatusCounts } from '../components/order-status-counts';

type ViewMode = 'grid' | 'table';

const OrdersContent = ({ viewMode }: { viewMode: ViewMode }) => {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const [filters, setFilters] = useOrdersFilters();
	const [updatingId, setUpdatingId] = useState<string | null>(null);

	const toLocalDate = (d: Date) =>
		`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

	const { data } = useSuspenseQuery(
		trpc.orders.getMany.queryOptions({
			page: filters.page,
			status: filters.status ?? undefined,
			search: filters.search || undefined,
			dateFrom: filters.dateFrom ? toLocalDate(filters.dateFrom) : undefined,
			dateTo: filters.dateTo ? toLocalDate(filters.dateTo) : undefined,
		})
	);

	const updateStatus = useMutation(
		trpc.orders.updateStatus.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: trpc.orders.getMany.queryKey() });
				toast.success('Order status updated');
				setUpdatingId(null);
			},
			onError: (e) => {
				toast.error(e.message);
				setUpdatingId(null);
			},
		})
	);

	const handleUpdate = (id: string, status: string) => {
		setUpdatingId(id);
		updateStatus.mutate({ id, status: status as never });
	};

	const statusCountsProps = {
		search: filters.search || undefined,
		dateFrom: filters.dateFrom ? toLocalDate(filters.dateFrom) : undefined,
		dateTo: filters.dateTo ? toLocalDate(filters.dateTo) : undefined,
	};

	if (data.items.length === 0) {
		return (
			<div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
				<OrderStatusCounts {...statusCountsProps} />
				<div className="flex flex-1 flex-col items-center justify-center gap-4 py-12 md:py-16">
					<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
						<ClipboardListIcon className="h-8 w-8 text-gray-400" />
					</div>
					<div className="text-center">
						<p className="text-sm font-semibold text-gray-700">No orders found</p>
						<p className="mt-1 text-xs text-gray-400">
							Orders will appear here after they are placed.
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
			<OrderStatusCounts {...statusCountsProps} />

			<p className="text-xs font-medium tracking-wider text-gray-400 uppercase">
				{data.total} order{data.total !== 1 ? 's' : ''}
			</p>

			{viewMode === 'grid' ? (
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3 xl:grid-cols-4">
					{data.items.map((order) => (
						<OrderCard
							key={order.id}
							order={{ ...order, createdAt: new Date(order.createdAt) }}
							onUpdate={handleUpdate}
							isPending={updatingId === order.id}
						/>
					))}
				</div>
			) : (
				<div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
					<Table>
						<TableHeader>
							<TableRow className="bg-gray-50 hover:bg-gray-50">
								{[
									'Order',
									'Customer',
									'Payment',
									'Cashier',
									'Items',
									'Total',
									'Status',
									'',
								].map((h) => (
									<TableHead
										key={h}
										className="px-4 py-3 text-xs font-semibold text-gray-600"
									>
										{h}
									</TableHead>
								))}
							</TableRow>
						</TableHeader>
						<TableBody>
							{data.items.map((order) => (
								<OrderRow
									key={order.id}
									order={{ ...order, createdAt: new Date(order.createdAt) }}
									onUpdate={handleUpdate}
									isPending={updatingId === order.id}
								/>
							))}
						</TableBody>
					</Table>
				</div>
			)}

			{data.totalPages > 1 && (
				<div className="pt-2">
					<PosPagination
						page={filters.page}
						totalPages={data.totalPages}
						onPageChange={(page) => setFilters({ page })}
					/>
				</div>
			)}
		</div>
	);
};

const OrdersView = () => {
	const [viewMode, setViewMode] = useState<ViewMode>('table');
	return (
		<div className="flex flex-1 flex-col bg-muted/40">
			<OrderListHeader viewMode={viewMode} onViewModeChange={setViewMode} />
			<ErrorBoundary
				fallback={
					<ErrorState
						title="Error loading orders"
						description="Please try again later."
					/>
				}
			>
				<Suspense fallback={<OrdersViewLoading />}>
					<OrdersContent viewMode={viewMode} />
				</Suspense>
			</ErrorBoundary>
		</div>
	);
};

export default OrdersView;
