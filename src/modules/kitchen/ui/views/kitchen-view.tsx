'use client';

import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Image from 'next/image';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorState from '@/components/error-state';

const PAYMENT_ICON: Record<string, React.ElementType> = {
	cash: BanknoteIcon,
	card: CreditCardIcon,
	qris: QrCodeIcon,
	transfer: ArrowRightLeftIcon,
};

type KitchenTab = 'pending' | 'processing';

const TABS: { value: KitchenTab; label: string; color: string; dot: string }[] = [
	{ value: 'pending', label: 'New Orders', color: 'text-amber-600', dot: 'bg-amber-400' },
	{ value: 'processing', label: 'In Progress', color: 'text-blue-400', dot: 'bg-blue-400' },
];

const OrderTimer = ({ createdAt }: { createdAt: string | Date }) => {
	const [label, setLabel] = useState('');
	useEffect(() => {
		const update = () =>
			setLabel(formatDistanceToNow(new Date(createdAt), { addSuffix: false }));
		update();
		const id = setInterval(update, 30_000);
		return () => clearInterval(id);
	}, [createdAt]);

	const mins = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60_000);
	const urgent = mins >= 15;
	const warning = mins >= 8;

	return (
		<span
			className={cn(
				'flex items-center gap-1 text-[10px] font-semibold tabular-nums',
				urgent ? 'text-red-400' : warning ? 'text-amber-400' : 'text-gray-400'
			)}
		>
			<ClockIcon className="h-3 w-3" />
			{label}
		</span>
	);
};

/* ── Order detail dialog ─────────────────────────────────────────────────── */
const KitchenOrderDetail = ({
	orderId,
	open,
	onOpenChange,
}: {
	orderId: string;
	open: boolean;
	onOpenChange: (v: boolean) => void;
}) => {
	const trpc = useTRPC();
	const { format: formatCurrency } = useCurrency();

	const { data: order, isLoading } = useQuery({
		...trpc.orders.getOne.queryOptions({ id: orderId }),
		enabled: open && !!orderId,
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85vh] w-[90vw] max-w-lg overflow-y-auto border-white/10 bg-gray-900 p-0 text-white">
				<DialogHeader className="border-b border-white/10 px-5 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-600">
								<PackageIcon className="h-4 w-4 text-white" />
							</div>
							<div>
								<DialogTitle className="font-mono text-sm font-bold text-white">
									#{orderId.slice(0, 8).toUpperCase()}
								</DialogTitle>
								{order && (
									<p className="text-[10px] text-gray-400">
										{format(
											new Date(order.createdAt),
											'dd MMM yyyy · HH:mm:ss'
										)}
									</p>
								)}
							</div>
						</div>
						{order && <OrderTimer createdAt={order.createdAt} />}
					</div>
				</DialogHeader>

				<div className="flex flex-col gap-4 p-5">
					{isLoading ? (
						<div className="flex flex-col gap-3">
							{Array.from({ length: 3 }).map((_, i) => (
								<Skeleton key={i} className="h-16 rounded-xl bg-white/5" />
							))}
						</div>
					) : !order ? (
						<p className="py-8 text-center text-sm text-gray-500">Order not found</p>
					) : (
						<>
							{/* Items list */}
							<div className="flex flex-col gap-3">
								<p className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
									Order Items · {order.items.length}
								</p>
								{order.items.map((item) => (
									<div
										key={item.id}
										className="overflow-hidden rounded-xl bg-white/5"
									>
										{item.productImageUrl ? (
											<div className="relative h-32 w-full">
												<Image
													src={item.productImageUrl}
													alt={item.name}
													fill
													sizes="480px"
													className="object-cover"
												/>
												<span className="absolute top-2 right-2 rounded-full bg-black/70 px-2.5 py-1 text-sm font-bold text-white backdrop-blur-sm">
													×{item.quantity}
												</span>
											</div>
										) : (
											<div className="relative flex h-20 w-full items-center justify-center bg-white/5">
												<UtensilsCrossedIcon className="h-8 w-8 text-gray-600" />
												<span className="absolute top-2 right-2 rounded-full bg-black/70 px-2.5 py-1 text-sm font-bold text-white">
													×{item.quantity}
												</span>
											</div>
										)}
										<div className="flex items-center justify-between px-3 py-2.5">
											<div className="min-w-0">
												<p className="truncate text-sm font-semibold text-white">
													{item.name}
												</p>
												<p className="text-xs text-gray-400">
													{formatCurrency(item.price)} each
												</p>
											</div>
											<p className="shrink-0 text-base font-bold text-green-400">
												{formatCurrency(item.subtotal)}
											</p>
										</div>
									</div>
								))}
							</div>
							{/* Note */}
							{order.note && (
								<div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
									<p className="mb-1 text-[10px] font-semibold tracking-wider text-amber-400 uppercase">
										Special Note
									</p>
									<p className="text-sm text-amber-300 italic">
										&ldquo;{order.note}&rdquo;
									</p>
								</div>
							)}

							{/* Totals */}
							<div className="rounded-xl bg-white/5 px-4 py-3 text-sm">
								<div className="flex justify-between text-gray-400">
									<span>Subtotal</span>
									<span>{formatCurrency(order.subtotal)}</span>
								</div>
								<div className="flex justify-between text-gray-400">
									<span>Tax</span>
									<span>{formatCurrency(order.tax)}</span>
								</div>
								{Number(order.serviceCharge) > 0 && (
									<div className="flex justify-between text-gray-400">
										<span>Service</span>
										<span>{formatCurrency(order.serviceCharge)}</span>
									</div>
								)}
								<div className="mt-2 flex justify-between border-t border-white/10 pt-2 text-base font-bold">
									<span className="text-white">Total</span>
									<span className="text-green-400">
										{formatCurrency(order.total)}
									</span>
								</div>
							</div>

							{/* Customer */}
							<div className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-3 text-sm">
								{order.customerId && order.customerName2 ? (
									<BadgeCheckIcon className="h-4 w-4 shrink-0 text-green-500" />
								) : (
									<UserIcon className="h-4 w-4 shrink-0 text-gray-500" />
								)}
								<span className="text-gray-300">
									{order.customerName2 ??
										order.customerName ??
										'Walk-in customer'}
								</span>
								{order.customerId && order.customerName2 && (
									<span className="ml-auto rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-semibold text-green-400">
										MEMBER
									</span>
								)}
							</div>
						</>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
};

const KitchenContent = () => {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { format: formatCurrency } = useCurrency();
	const [tab, setTab] = useState<KitchenTab>('pending');
	const [updatingId, setUpdatingId] = useState<string | null>(null);
	const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

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
		const id = setInterval(invalidateAll, 30_000);
		return () => clearInterval(id);
	}, [queryClient, trpc]);

	const updateStatus = useMutation(
		trpc.orders.updateStatus.mutationOptions({
			onSuccess: (_, vars) => {
				invalidateAll();
				toast.success(vars.status === 'processing' ? 'Order accepted' : 'Order completed', {
					icon: <CheckCircleIcon className="h-4 w-4 text-green-400" />,
				});
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

	return (
		<div className="flex flex-1 flex-col">
			{selectedOrderId && (
				<KitchenOrderDetail
					orderId={selectedOrderId}
					open={!!selectedOrderId}
					onOpenChange={(v) => !v && setSelectedOrderId(null)}
				/>
			)}

			{/* Header */}
			<div className="border-b border-white/10 bg-gray-900 px-6 py-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600">
							<UtensilsCrossedIcon className="h-5 w-5 text-white" />
						</div>
						<div>
							<h1 className="text-base font-semibold text-white">Kitchen Display</h1>
							<p className="text-xs text-gray-400">
								{format(new Date(), 'EEEE, dd MMM yyyy · HH:mm')}
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2 text-xs text-gray-500">
						<RefreshCwIcon className="h-3 w-3" />
						Auto-refreshes every 30s
					</div>
				</div>

				{/* Tabs */}
				<div className="mt-4 flex items-center gap-1">
					{TABS.map((t) => (
						<button
							key={t.value}
							onClick={() => setTab(t.value)}
							className={cn(
								'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
								tab === t.value
									? 'bg-white/10 text-white'
									: 'text-gray-500 hover:text-gray-300'
							)}
						>
							<span className={cn('h-2 w-2 rounded-full', t.dot)} />
							{t.label}
							<span
								className={cn(
									'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
									tab === t.value
										? 'bg-white/20 text-white'
										: 'bg-white/5 text-gray-500'
								)}
							>
								{counts ? counts[t.value] : '—'}
							</span>
						</button>
					))}
				</div>
			</div>

			{/* Order grid */}
			<div className="flex-1 overflow-y-auto p-6">
				{data.items.length === 0 ? (
					<div className="flex flex-1 flex-col items-center justify-center gap-4 py-32">
						<div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5">
							<UtensilsCrossedIcon className="h-10 w-10 text-gray-600" />
						</div>
						<p className="text-sm font-semibold text-gray-500">
							{tab === 'pending' ? 'No new orders' : 'Nothing in progress'}
						</p>
						<p className="text-xs text-gray-600">
							Orders will appear here automatically
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{data.items.map((order) => {
							const isPending = updatingId === order.id;
							const isMember = !!order.customerId && !!order.customerName2;
							const displayCustomer =
								order.customerName2 ?? order.customerName ?? 'Walk-in';
							const PayIcon = order.paymentMethod
								? PAYMENT_ICON[order.paymentMethod]
								: null;

							return (
								<div
									key={order.id}
									className={cn(
										'flex flex-col overflow-hidden rounded-2xl border transition-all duration-300',
										tab === 'pending'
											? 'border-amber-500/30 bg-gray-900 shadow-[0_0_20px_rgba(251,191,36,0.08)]'
											: 'border-blue-500/30 bg-gray-900 shadow-[0_0_20px_rgba(59,130,246,0.08)]'
									)}
								>
									{/* colour bar */}
									<div
										className={cn(
											'h-1 w-full',
											tab === 'pending' ? 'bg-amber-400' : 'bg-blue-500'
										)}
									/>

									<div className="flex flex-col gap-3 p-4">
										{/* Order ID + timer */}
										<div className="flex items-center justify-between">
											<span className="font-mono text-sm font-bold text-white">
												#{order.id.slice(0, 8).toUpperCase()}
											</span>
											<OrderTimer createdAt={order.createdAt} />
										</div>

										{/* Time placed */}
										<p className="text-[10px] text-gray-500">
											Placed at{' '}
											{format(new Date(order.createdAt), 'HH:mm:ss')}
										</p>

										{/* Items */}
										<div className="rounded-xl bg-white/5 px-3 py-2">
											<div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
												<PackageIcon className="h-3 w-3" />
												{order.itemCount ?? 0} item
												{(order.itemCount ?? 0) !== 1 ? 's' : ''}
											</div>
											<p className="text-sm font-bold text-white">
												{formatCurrency(order.total)}
											</p>
											{order.note && (
												<p className="mt-1.5 text-[11px] text-amber-400 italic">
													&ldquo;{order.note}&rdquo;
												</p>
											)}
										</div>

										{/* Customer + payment */}
										<div className="flex items-center justify-between text-xs">
											<span className="flex items-center gap-1.5 text-gray-400">
												{isMember ? (
													<BadgeCheckIcon className="h-3.5 w-3.5 text-green-500" />
												) : (
													<UserIcon className="h-3.5 w-3.5" />
												)}
												{displayCustomer}
											</span>
											{PayIcon && (
												<span className="flex items-center gap-1 text-gray-500">
													<PayIcon className="h-3.5 w-3.5" />
												</span>
											)}
										</div>

										{/* View details */}
										<button
											onClick={() => setSelectedOrderId(order.id)}
											className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:border-white/20 hover:text-white"
										>
											<EyeIcon className="h-3.5 w-3.5" />
											View order items
										</button>

										{/* Action button */}
										{tab === 'pending' ? (
											<Button
												onClick={() => handleAction(order.id, 'processing')}
												disabled={isPending}
												className="mt-1 w-full bg-amber-500 text-sm font-semibold text-white hover:bg-amber-400 disabled:opacity-60"
											>
												{isPending ? (
													<Loader2Icon className="h-4 w-4 animate-spin" />
												) : (
													<>
														<RefreshCwIcon className="mr-2 h-4 w-4" />
														Accept Order
													</>
												)}
											</Button>
										) : (
											<Button
												onClick={() => handleAction(order.id, 'completed')}
												disabled={isPending}
												className="mt-1 w-full bg-green-600 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-60"
											>
												{isPending ? (
													<Loader2Icon className="h-4 w-4 animate-spin" />
												) : (
													<>
														<CheckCircleIcon className="mr-2 h-4 w-4" />
														Mark Complete
													</>
												)}
											</Button>
										)}
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
};

export const KitchenViewLoading = () => (
	<div className="flex flex-1 flex-col">
		<div className="border-b border-white/10 bg-gray-900 px-6 py-4">
			<div className="flex items-center gap-3">
				<Skeleton className="h-10 w-10 rounded-xl bg-white/10" />
				<div className="space-y-1.5">
					<Skeleton className="h-4 w-36 bg-white/10" />
					<Skeleton className="h-3 w-48 bg-white/10" />
				</div>
			</div>
		</div>
		<div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{Array.from({ length: 6 }).map((_, i) => (
				<Skeleton key={i} className="h-64 rounded-2xl bg-white/5" />
			))}
		</div>
	</div>
);

const KitchenView = () => (
	<div className="flex flex-1 flex-col">
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
