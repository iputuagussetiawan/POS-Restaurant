'use client';

import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useRef, Suspense } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { KitchenViewLoading } from './kitchen-view-loading';
import {
	UtensilsCrossedIcon,
	ClockIcon,
	CheckCircleIcon,
	RefreshCwIcon,
	WifiIcon,
} from 'lucide-react';
import MenuProfile from '@/modules/pos/ui/components/menu-profile';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorState from '@/components/error-state';
import { KitchenLiveClock } from '../components/kitchen-live-clock';
import { KitchenOrderDetail } from '../components/kitchen-order-detail';
import { KitchenOrderCard } from '../components/kitchen-order-card';
import { type KitchenTab } from '../components/kitchen-constants';

/* ── Main content ── */
const KitchenContent = () => {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const [tab, setTab] = useState<KitchenTab>('pending');
	const [updatingId, setUpdatingId] = useState<string | null>(null);
	const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
	const prevPendingCount = useRef<number>(0);

	const { data } = useSuspenseQuery(
		trpc.orders.getMany.queryOptions({
			page: 1,
			pageSize: 50,
			status: tab,
			sortOrder: 'asc',
		})
	);

	const { data: counts } = useQuery(trpc.orders.statusCounts.queryOptions({}));

	const invalidateAll = () => {
		queryClient.invalidateQueries({ queryKey: trpc.orders.getMany.queryKey() });
		queryClient.invalidateQueries({ queryKey: trpc.orders.statusCounts.queryKey() });
	};

	useEffect(() => {
		const current = counts?.pending ?? 0;
		if (current > prevPendingCount.current && prevPendingCount.current > 0) {
			toast('🔔 New order received!', {
				description: `${current} order${current !== 1 ? 's' : ''} waiting`,
				duration: 4000,
			});
		}
		prevPendingCount.current = current;
	}, [counts?.pending]);

	useEffect(() => {
		const id = setInterval(invalidateAll, 30_000);
		return () => clearInterval(id);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const updateStatus = useMutation(
		trpc.orders.updateStatus.mutationOptions({
			onSuccess: (_, vars) => {
				invalidateAll();
				toast.success(
					vars.status === 'processing' ? 'Order accepted!' : 'Order completed!',
					{ icon: <CheckCircleIcon className="h-4 w-4 text-green-400" /> }
				);
				setUpdatingId(null);
			},
			onError: (e) => {
				toast.error(e.message);
				setUpdatingId(null);
			},
		})
	);

	const handleAction = (id: string, next: 'processing' | 'completed') => {
		setUpdatingId(id);
		updateStatus.mutate({ id, status: next });
	};

	const pendingCount = counts?.pending ?? 0;
	const processingCount = counts?.processing ?? 0;

	return (
		<div className="flex flex-1 flex-col">
			{selectedOrderId && (
				<KitchenOrderDetail
					orderId={selectedOrderId}
					open={!!selectedOrderId}
					onOpenChange={(v) => !v && setSelectedOrderId(null)}
					onAction={handleAction}
					tab={tab}
					isActing={updatingId === selectedOrderId}
				/>
			)}

			{/* Header */}
			<div className="border-b border-white/10 bg-gray-950 px-6 py-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-900/40">
							<UtensilsCrossedIcon className="h-6 w-6 text-white" />
						</div>
						<div>
							<h1 className="text-lg font-bold text-white">Kitchen Display</h1>
							<p className="text-xs text-gray-500">
								{format(new Date(), 'EEEE, dd MMM yyyy')}
							</p>
						</div>
					</div>
					<div className="flex items-center gap-3">
						<KitchenLiveClock />
						<div className="flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1">
							<WifiIcon className="h-3 w-3 text-green-400" />
							<span className="text-[11px] font-medium text-green-400">Live</span>
						</div>
						<MenuProfile dark />
					</div>
				</div>

				{/* Tabs */}
				<div className="mt-5 flex items-end gap-3">
					<button
						onClick={() => setTab('pending')}
						className={cn(
							'relative flex items-center gap-2.5 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200',
							tab === 'pending'
								? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40'
								: 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
						)}
					>
						<ClockIcon className="h-4 w-4" />
						New Orders
						<span
							className={cn(
								'min-w-[1.5rem] rounded-full px-1.5 py-0.5 text-center text-xs font-extrabold tabular-nums',
								tab === 'pending'
									? 'bg-amber-500 text-white'
									: pendingCount > 0
										? 'bg-amber-500/30 text-amber-400'
										: 'bg-white/5 text-gray-600'
							)}
						>
							{pendingCount}
						</span>
						{pendingCount > 0 && tab !== 'pending' && (
							<span className="absolute -top-1 -right-1 flex h-3 w-3">
								<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
								<span className="relative inline-flex h-3 w-3 rounded-full bg-amber-500" />
							</span>
						)}
					</button>

					<button
						onClick={() => setTab('processing')}
						className={cn(
							'flex items-center gap-2.5 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200',
							tab === 'processing'
								? 'bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/40'
								: 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
						)}
					>
						<RefreshCwIcon className="h-4 w-4" />
						In Progress
						<span
							className={cn(
								'min-w-[1.5rem] rounded-full px-1.5 py-0.5 text-center text-xs font-extrabold tabular-nums',
								tab === 'processing'
									? 'bg-blue-500 text-white'
									: 'bg-white/5 text-gray-600'
							)}
						>
							{processingCount}
						</span>
					</button>

					<button
						onClick={invalidateAll}
						className="ml-auto flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-[11px] font-medium text-gray-500 transition-colors hover:border-white/20 hover:bg-white/5 hover:text-gray-300"
					>
						<RefreshCwIcon className="h-3 w-3" />
						Refresh
					</button>
				</div>
			</div>

			{/* Order grid */}
			<div className="flex-1 overflow-y-auto bg-gray-950 p-5">
				{data.items.length === 0 ? (
					<div className="flex h-full flex-col items-center justify-center gap-5 py-24">
						<div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white/5">
							{tab === 'pending' ? (
								<ClockIcon className="h-12 w-12 text-gray-700" />
							) : (
								<CheckCircleIcon className="h-12 w-12 text-gray-700" />
							)}
						</div>
						<div className="text-center">
							<p className="text-base font-bold text-gray-500">
								{tab === 'pending' ? 'No new orders' : 'All caught up!'}
							</p>
							<p className="mt-1 text-sm text-gray-700">
								{tab === 'pending'
									? 'New orders will appear here automatically'
									: 'No orders in progress right now'}
							</p>
						</div>
					</div>
				) : (
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
						{data.items.map((order) => (
							<KitchenOrderCard
								key={order.id}
								order={{ ...order, createdAt: String(order.createdAt) }}
								tab={tab}
								onAction={handleAction}
								isActing={updatingId === order.id}
								onView={() => setSelectedOrderId(order.id)}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

/* ── Root ── */
const KitchenView = () => (
	<div className="flex flex-1 flex-col bg-gray-950">
		<ErrorBoundary
			fallback={
				<ErrorState title="Error loading kitchen" description="Please try again later." />
			}
		>
			<Suspense fallback={<KitchenViewLoading />}>
				<KitchenContent />
			</Suspense>
		</ErrorBoundary>
	</div>
);

export default KitchenView;
