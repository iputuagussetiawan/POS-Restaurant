'use client';

import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import { useCurrency } from '@/modules/company/hooks/use-currency';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
	UtensilsCrossedIcon,
	ClockIcon,
	CheckCircleIcon,
	RefreshCwIcon,
	PackageIcon,
	UserIcon,
	BadgeCheckIcon,
	Loader2Icon,
	BanknoteIcon,
	CreditCardIcon,
	QrCodeIcon,
	ArrowRightLeftIcon,
	EyeIcon,
	WifiIcon,
	AlertTriangleIcon,
	CheckIcon,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Image from 'next/image';
import MenuProfile from '@/modules/pos/ui/components/menu-profile';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorState from '@/components/error-state';

const PAYMENT_ICON: Record<string, React.ElementType> = {
	cash: BanknoteIcon,
	card: CreditCardIcon,
	qris: QrCodeIcon,
	transfer: ArrowRightLeftIcon,
};

const PAYMENT_LABEL: Record<string, string> = {
	cash: 'Cash',
	card: 'Card',
	qris: 'QRIS',
	transfer: 'Transfer',
};

type KitchenTab = 'pending' | 'processing';

/* ── Live clock ─────────────────────────────────────────────────────────── */
const LiveClock = () => {
	const [time, setTime] = useState('');
	useEffect(() => {
		const tick = () => setTime(format(new Date(), 'HH:mm:ss'));
		tick();
		const id = setInterval(tick, 1000);
		return () => clearInterval(id);
	}, []);
	return <span className="font-mono text-sm font-bold text-white tabular-nums">{time}</span>;
};

/* ── Order timer ─────────────────────────────────────────────────────────── */
const OrderTimer = ({ createdAt }: { createdAt: string | Date }) => {
	const [label, setLabel] = useState('');
	const [mins, setMins] = useState(0);

	useEffect(() => {
		const update = () => {
			setLabel(formatDistanceToNow(new Date(createdAt), { addSuffix: false }));
			setMins(Math.floor((Date.now() - new Date(createdAt).getTime()) / 60_000));
		};
		update();
		const id = setInterval(update, 10_000);
		return () => clearInterval(id);
	}, [createdAt]);

	const urgent = mins >= 15;
	const warning = mins >= 8;

	return (
		<span
			className={cn(
				'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tabular-nums',
				urgent
					? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/40'
					: warning
						? 'bg-amber-500/20 text-amber-400'
						: 'bg-white/5 text-gray-500'
			)}
		>
			{urgent && <AlertTriangleIcon className="h-3 w-3 animate-pulse" />}
			<ClockIcon className={cn('h-3 w-3', !urgent && 'hidden')} />
			{!urgent && <ClockIcon className="h-3 w-3" />}
			{label}
		</span>
	);
};

/* ── Order detail dialog ─────────────────────────────────────────────────── */
const KitchenOrderDetail = ({
	orderId,
	open,
	onOpenChange,
	onAction,
	tab,
	isActing,
}: {
	orderId: string;
	open: boolean;
	onOpenChange: (v: boolean) => void;
	onAction: (id: string, next: 'processing' | 'completed') => void;
	tab: KitchenTab;
	isActing: boolean;
}) => {
	const trpc = useTRPC();
	const { format: formatCurrency } = useCurrency();

	const { data: order, isLoading } = useQuery({
		...trpc.orders.getOne.queryOptions({ id: orderId }),
		enabled: open && !!orderId,
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] w-[95vw] max-w-xl overflow-hidden border-white/10 bg-gray-950 p-0 text-white">
				{/* Header */}
				<DialogHeader className="border-b border-white/10 px-5 py-4">
					<div className="flex items-center justify-between pr-6">
						<div className="flex items-center gap-3">
							<div
								className={cn(
									'flex h-10 w-10 items-center justify-center rounded-xl',
									tab === 'pending' ? 'bg-amber-500' : 'bg-blue-600'
								)}
							>
								<PackageIcon className="h-5 w-5 text-white" />
							</div>
							<div>
								<DialogTitle className="font-mono text-base font-bold text-white">
									#{orderId.slice(0, 8).toUpperCase()}
								</DialogTitle>
								{order && (
									<p className="text-[10px] text-gray-400">
										{format(
											new Date(order.createdAt),
											'EEEE, dd MMM · HH:mm:ss'
										)}
									</p>
								)}
							</div>
						</div>
						{order && <OrderTimer createdAt={order.createdAt} />}
					</div>
				</DialogHeader>

				<div className="flex max-h-[calc(90vh-130px)] flex-col gap-0 overflow-y-auto">
					{isLoading ? (
						<div className="flex flex-col gap-3 p-5">
							{Array.from({ length: 3 }).map((_, i) => (
								<Skeleton key={i} className="h-20 rounded-xl bg-white/5" />
							))}
						</div>
					) : !order ? (
						<p className="py-12 text-center text-sm text-gray-500">Order not found</p>
					) : (
						<>
							{/* Note banner — top of dialog if present */}
							{order.note && (
								<div className="border-b border-amber-500/20 bg-amber-500/10 px-5 py-3">
									<div className="flex items-start gap-2">
										<AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
										<div>
											<p className="text-[10px] font-bold tracking-wider text-amber-400 uppercase">
												Special Instructions
											</p>
											<p className="mt-0.5 text-sm text-amber-200 italic">
												&ldquo;{order.note}&rdquo;
											</p>
										</div>
									</div>
								</div>
							)}

							{/* Items */}
							<div className="flex flex-col gap-1 p-5">
								<p className="mb-2 text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
									{order.items.length} item{order.items.length !== 1 ? 's' : ''}{' '}
									to prepare
								</p>
								{order.items.map((item, idx) => (
									<div
										key={item.id}
										className="flex gap-3 overflow-hidden rounded-xl bg-white/5 p-3"
									>
										{/* index number */}
										<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-sm font-bold text-gray-400">
											{idx + 1}
										</div>

										{/* image */}
										{item.productImageUrl ? (
											<div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
												<Image
													src={item.productImageUrl}
													alt={item.name}
													fill
													sizes="56px"
													className="object-cover"
												/>
											</div>
										) : (
											<div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-white/10">
												<UtensilsCrossedIcon className="h-6 w-6 text-gray-600" />
											</div>
										)}

										{/* info */}
										<div className="min-w-0 flex-1">
											<p className="truncate text-sm font-semibold text-white">
												{item.name}
											</p>
											<p className="text-xs text-gray-400">
												{formatCurrency(item.price)} × {item.quantity}
											</p>
										</div>

										{/* qty + subtotal */}
										<div className="flex shrink-0 flex-col items-end gap-1">
											<span className="rounded-full bg-white/15 px-2.5 py-0.5 text-sm font-bold text-white">
												×{item.quantity}
											</span>
											<span className="text-xs font-semibold text-green-400">
												{formatCurrency(item.subtotal)}
											</span>
										</div>
									</div>
								))}
							</div>

							{/* Footer: totals + customer + action */}
							<div className="border-t border-white/10 bg-black/30 px-5 py-4">
								{/* customer + cashier */}
								<div className="mb-3 flex items-center justify-between text-xs text-gray-400">
									<span className="flex items-center gap-1.5">
										{order.customerId && order.customerName2 ? (
											<BadgeCheckIcon className="h-3.5 w-3.5 text-green-500" />
										) : (
											<UserIcon className="h-3.5 w-3.5" />
										)}
										<span
											className={cn(
												order.customerId &&
													order.customerName2 &&
													'text-green-400'
											)}
										>
											{order.customerName2 ?? order.customerName ?? 'Walk-in'}
										</span>
									</span>
									{order.cashierName && (
										<span className="text-gray-600">
											Cashier: {order.cashierName}
										</span>
									)}
								</div>

								{/* total */}
								<div className="mb-4 flex items-baseline justify-between">
									<span className="text-sm text-gray-400">Order total</span>
									<span className="text-xl font-bold text-green-400">
										{formatCurrency(order.total)}
									</span>
								</div>

								{/* action button inside dialog */}
								{tab === 'pending' ? (
									<Button
										onClick={() => {
											onAction(orderId, 'processing');
											onOpenChange(false);
										}}
										disabled={isActing}
										className="w-full bg-amber-500 py-6 text-base font-bold text-white hover:bg-amber-400"
									>
										{isActing ? (
											<Loader2Icon className="h-5 w-5 animate-spin" />
										) : (
											<>
												<RefreshCwIcon className="mr-2 h-5 w-5" />
												Accept & Start Preparing
											</>
										)}
									</Button>
								) : (
									<Button
										onClick={() => {
											onAction(orderId, 'completed');
											onOpenChange(false);
										}}
										disabled={isActing}
										className="w-full bg-green-600 py-6 text-base font-bold text-white hover:bg-green-500"
									>
										{isActing ? (
											<Loader2Icon className="h-5 w-5 animate-spin" />
										) : (
											<>
												<CheckCircleIcon className="mr-2 h-5 w-5" />
												Mark as Completed
											</>
										)}
									</Button>
								)}
							</div>
						</>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
};

/* ── Order card ──────────────────────────────────────────────────────────── */
const OrderCard = ({
	order,
	tab,
	onAction,
	isActing,
	onView,
}: {
	order: {
		id: string;
		createdAt: string;
		total: string;
		subtotal: string;
		itemCount?: number | null;
		note?: string | null;
		paymentMethod?: string | null;
		customerName?: string | null;
		customerName2?: string | null;
		customerId?: string | null;
		cashierName?: string | null;
	};
	tab: KitchenTab;
	onAction: (id: string, next: 'processing' | 'completed') => void;
	isActing: boolean;
	onView: () => void;
}) => {
	const { format: formatCurrency } = useCurrency();
	const isMember = !!order.customerId && !!order.customerName2;
	const displayCustomer = order.customerName2 ?? order.customerName ?? 'Walk-in';
	const PayIcon = order.paymentMethod ? PAYMENT_ICON[order.paymentMethod] : null;
	const mins = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60_000);
	const urgent = mins >= 15;

	return (
		<div
			className={cn(
				'group flex flex-col overflow-hidden rounded-2xl border transition-all duration-300',
				urgent
					? 'border-red-500/50 bg-gray-900 shadow-[0_0_30px_rgba(239,68,68,0.15)] ring-1 ring-red-500/20'
					: tab === 'pending'
						? 'border-amber-500/30 bg-gray-900 shadow-[0_0_20px_rgba(251,191,36,0.06)]'
						: 'border-blue-500/30 bg-gray-900 shadow-[0_0_20px_rgba(59,130,246,0.06)]'
			)}
		>
			{/* top gradient bar */}
			<div
				className={cn(
					'h-1.5 w-full',
					urgent
						? 'bg-gradient-to-r from-red-500 to-rose-400'
						: tab === 'pending'
							? 'bg-gradient-to-r from-amber-400 to-orange-400'
							: 'bg-gradient-to-r from-blue-500 to-cyan-400'
				)}
			/>

			<div className="flex flex-1 flex-col gap-3 p-4">
				{/* Row 1: order ID + timer */}
				<div className="flex items-center justify-between">
					<div>
						<span className="font-mono text-base font-extrabold tracking-wide text-white">
							#{order.id.slice(0, 8).toUpperCase()}
						</span>
						<p className="text-[10px] text-gray-600">
							{format(new Date(order.createdAt), 'HH:mm:ss')}
						</p>
					</div>
					<OrderTimer createdAt={order.createdAt} />
				</div>

				{/* Row 2: item count + total */}
				<div
					className={cn(
						'rounded-xl px-3 py-2.5',
						urgent ? 'bg-red-500/10' : 'bg-white/5'
					)}
				>
					<div className="flex items-center justify-between">
						<span className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
							<PackageIcon className="h-3 w-3" />
							{order.itemCount ?? 0} item{(order.itemCount ?? 0) !== 1 ? 's' : ''}
						</span>
						<span className="text-sm font-bold text-white">
							{formatCurrency(order.total)}
						</span>
					</div>
				</div>

				{/* Note — highlighted if present */}
				{order.note && (
					<div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2">
						<AlertTriangleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
						<p className="text-[11px] leading-snug text-amber-300 italic">
							{order.note}
						</p>
					</div>
				)}

				{/* Row 3: pills row */}
				<div className="flex flex-wrap items-center gap-1.5">
					{/* status */}
					<span
						className={cn(
							'flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold',
							urgent
								? 'bg-red-500/20 text-red-400'
								: tab === 'pending'
									? 'bg-amber-500/20 text-amber-300'
									: 'bg-blue-500/20 text-blue-300'
						)}
					>
						{urgent ? (
							<AlertTriangleIcon className="h-2.5 w-2.5" />
						) : tab === 'pending' ? (
							<ClockIcon className="h-2.5 w-2.5" />
						) : (
							<RefreshCwIcon className="h-2.5 w-2.5" />
						)}
						{urgent ? 'URGENT' : tab === 'pending' ? 'New' : 'In Progress'}
					</span>

					{/* payment */}
					{PayIcon && order.paymentMethod && (
						<span className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-gray-300">
							<PayIcon className="h-2.5 w-2.5" />
							{PAYMENT_LABEL[order.paymentMethod] ?? order.paymentMethod}
						</span>
					)}
				</div>

				{/* Row 4: customer + cashier */}
				<div className="flex items-center gap-1.5 border-t border-white/5 pt-2 text-xs text-gray-500">
					{isMember ? (
						<BadgeCheckIcon className="h-3.5 w-3.5 shrink-0 text-green-500" />
					) : (
						<UserIcon className="h-3.5 w-3.5 shrink-0" />
					)}
					<span className={cn('truncate', isMember && 'text-green-400')}>
						{displayCustomer}
					</span>
					{order.cashierName && (
						<span className="ml-auto shrink-0 text-[10px] text-gray-700">
							{order.cashierName}
						</span>
					)}
				</div>

				{/* Row 5: view + action */}
				<div className="flex gap-2 pt-1">
					<button
						onClick={onView}
						className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 py-2 text-xs font-medium text-gray-400 transition-colors hover:border-white/20 hover:bg-white/5 hover:text-white"
					>
						<EyeIcon className="h-3.5 w-3.5" />
						Details
					</button>

					{tab === 'pending' ? (
						<Button
							onClick={() => onAction(order.id, 'processing')}
							disabled={isActing}
							size="sm"
							className="flex-1 bg-amber-500 text-xs font-bold text-white hover:bg-amber-400 disabled:opacity-60"
						>
							{isActing ? (
								<Loader2Icon className="h-3.5 w-3.5 animate-spin" />
							) : (
								<>
									<RefreshCwIcon className="mr-1.5 h-3.5 w-3.5" />
									Accept
								</>
							)}
						</Button>
					) : (
						<Button
							onClick={() => onAction(order.id, 'completed')}
							disabled={isActing}
							size="sm"
							className="flex-1 bg-green-600 text-xs font-bold text-white hover:bg-green-500 disabled:opacity-60"
						>
							{isActing ? (
								<Loader2Icon className="h-3.5 w-3.5 animate-spin" />
							) : (
								<>
									<CheckIcon className="mr-1.5 h-3.5 w-3.5" />
									Done
								</>
							)}
						</Button>
					)}
				</div>
			</div>
		</div>
	);
};

/* ── Main content ────────────────────────────────────────────────────────── */
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

	// Flash tab on new pending orders
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

			{/* ── Header ── */}
			<div className="border-b border-white/10 bg-gray-950 px-6 py-4">
				<div className="flex items-center justify-between">
					{/* brand */}
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

					{/* clock + status + profile */}
					<div className="flex items-center gap-3">
						<LiveClock />
						<div className="flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1">
							<WifiIcon className="h-3 w-3 text-green-400" />
							<span className="text-[11px] font-medium text-green-400">Live</span>
						</div>
						<MenuProfile dark />
					</div>
				</div>

				{/* ── Tabs ── */}
				<div className="mt-5 flex items-end gap-3">
					{/* New Orders tab */}
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

					{/* In Progress tab */}
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

					{/* manual refresh */}
					<button
						onClick={invalidateAll}
						className="ml-auto flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-[11px] font-medium text-gray-500 transition-colors hover:border-white/20 hover:bg-white/5 hover:text-gray-300"
					>
						<RefreshCwIcon className="h-3 w-3" />
						Refresh
					</button>
				</div>
			</div>

			{/* ── Order grid ── */}
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
							<OrderCard
								key={order.id}
								order={{
									...order,
									createdAt:
										typeof order.createdAt === 'string'
											? order.createdAt
											: order.createdAt.toISOString(),
								}}
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

/* ── Skeleton ────────────────────────────────────────────────────────────── */
export const KitchenViewLoading = () => (
	<div className="flex flex-1 flex-col bg-gray-950">
		<div className="border-b border-white/10 px-6 py-4">
			<div className="flex items-center gap-3">
				<Skeleton className="h-11 w-11 rounded-xl bg-white/10" />
				<div className="space-y-1.5">
					<Skeleton className="h-5 w-36 bg-white/10" />
					<Skeleton className="h-3 w-48 bg-white/10" />
				</div>
			</div>
			<div className="mt-5 flex gap-3">
				<Skeleton className="h-11 w-36 rounded-xl bg-white/10" />
				<Skeleton className="h-11 w-36 rounded-xl bg-white/10" />
			</div>
		</div>
		<div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{Array.from({ length: 8 }).map((_, i) => (
				<Skeleton key={i} className="h-72 rounded-2xl bg-white/5" />
			))}
		</div>
	</div>
);

/* ── Root ────────────────────────────────────────────────────────────────── */
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
