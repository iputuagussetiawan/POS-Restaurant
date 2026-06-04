'use client';

import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery, useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Suspense, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorState from '@/components/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { useOrdersFilters } from '@/modules/orders/hooks/use-orders-filter';
import OrderListHeader from '@/modules/orders/ui/components/order-list-header';
import { OrderStatusBadge } from '@/modules/orders/ui/components/order-status-badge';
import PosPagination from '@/modules/pos/ui/components/pos-pagination';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
	ClipboardListIcon,
	MoreHorizontalIcon,
	RefreshCwIcon,
	XCircleIcon,
	CheckCircleIcon,
	ClockIcon,
	Loader2Icon,
	BanknoteIcon,
	CreditCardIcon,
	QrCodeIcon,
	ArrowRightLeftIcon,
	UserIcon,
	BadgeCheckIcon,
	PackageIcon,
	ShieldCheckIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/modules/company/hooks/use-currency';

type ViewMode = 'grid' | 'table';

const STATUS_ICON: Record<string, { icon: React.ElementType; bg: string; color: string }> = {
	pending: { icon: ClockIcon, bg: 'bg-yellow-100', color: 'text-yellow-600' },
	processing: { icon: RefreshCwIcon, bg: 'bg-blue-100', color: 'text-blue-600' },
	completed: { icon: CheckCircleIcon, bg: 'bg-green-100', color: 'text-green-600' },
	cancelled: { icon: XCircleIcon, bg: 'bg-red-100', color: 'text-red-500' },
};

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

const STATUS_TRANSITIONS: Record<
	string,
	{ next: string; label: string; icon: React.ElementType; danger?: boolean }[]
> = {
	pending: [
		{ next: 'processing', label: 'Mark Processing', icon: RefreshCwIcon },
		{ next: 'cancelled', label: 'Cancel Order', icon: XCircleIcon, danger: true },
	],
	processing: [
		{ next: 'completed', label: 'Mark Completed', icon: CheckCircleIcon },
		{ next: 'cancelled', label: 'Cancel Order', icon: XCircleIcon, danger: true },
	],
	completed: [],
	cancelled: [],
};

const GRADIENT: Record<string, string> = {
	completed: 'from-green-500 to-emerald-600',
	processing: 'from-blue-500 to-blue-600',
	pending: 'from-yellow-400 to-amber-500',
	cancelled: 'from-red-400 to-rose-500',
};

type Order = {
	id: string;
	status: string;
	subtotal: string;
	tax: string;
	serviceCharge: string;
	total: string;
	note?: string | null;
	paymentMethod?: string | null;
	customerName?: string | null;
	customerId?: string | null;
	cashierId?: string | null;
	createdAt: Date;
	// joined
	customerName2?: string | null;
	customerPhone?: string | null;
	cashierName?: string | null;
	itemCount?: number | null;
};

/* ── Action menu ────────────────────────────────────────────────────────── */
const ActionMenu = ({
	order,
	onUpdate,
	isPending,
}: {
	order: Order;
	onUpdate: (id: string, status: string) => void;
	isPending?: boolean;
}) => {
	const transitions = STATUS_TRANSITIONS[order.status] ?? [];
	if (transitions.length === 0) return <div className="h-8 w-8 shrink-0" />;
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					size="icon"
					disabled={isPending}
					className="h-8 w-8 shrink-0 rounded-lg border-gray-200"
				>
					{isPending ? (
						<Loader2Icon className="h-4 w-4 animate-spin text-gray-400" />
					) : (
						<MoreHorizontalIcon className="h-4 w-4" />
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-52 p-1.5">
				<p className="px-2 pt-0.5 pb-1.5 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
					Change Status
				</p>
				{transitions.map((t) => (
					<DropdownMenuItem
						key={t.next}
						onClick={() => onUpdate(order.id, t.next)}
						className={cn(
							'cursor-pointer rounded-md px-3 py-2 text-sm',
							t.danger
								? 'text-red-500 focus:bg-red-50 focus:text-red-600'
								: 'focus:bg-green-50 focus:text-green-700'
						)}
					>
						<t.icon className="mr-2 h-3.5 w-3.5" />
						{t.label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

/* ── Grid card ──────────────────────────────────────────────────────────── */
const OrderCard = ({
	order,
	onUpdate,
	isPending,
}: {
	order: Order;
	onUpdate: (id: string, status: string) => void;
	isPending?: boolean;
}) => {
	const { format: formatCurrency } = useCurrency();
	const cfg = STATUS_ICON[order.status] ?? STATUS_ICON.pending;
	const Icon = cfg.icon;
	const gradient = GRADIENT[order.status] ?? GRADIENT.pending;
	const PayIcon = order.paymentMethod ? PAYMENT_ICON[order.paymentMethod] : BanknoteIcon;
	const displayCustomer = order.customerName2 ?? order.customerName ?? null;
	const isMember = !!order.customerId && !!order.customerName2;

	return (
		<div className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.07)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
			{/* colour bar */}
			<div className={cn('h-1.5 w-full bg-gradient-to-r', gradient)} />

			<div className="flex flex-col gap-3 p-4">
				{/* ── Row 1: ID + date + action ── */}
				<div className="flex items-start justify-between">
					<div className="flex items-center gap-2.5">
						<div
							className={cn(
								'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
								cfg.bg
							)}
						>
							<Icon className={cn('h-4.5 w-4.5', cfg.color)} />
						</div>
						<div>
							<p className="font-mono text-sm font-bold tracking-wide text-gray-800">
								#{order.id.slice(0, 8).toUpperCase()}
							</p>
							<p className="text-[11px] text-gray-400">
								{format(new Date(order.createdAt), 'dd MMM yyyy · HH:mm')}
							</p>
						</div>
					</div>
					<ActionMenu order={order} onUpdate={onUpdate} isPending={isPending} />
				</div>

				{/* ── Row 2: total hero ── */}
				<div className="rounded-xl bg-gray-50 px-4 py-3">
					<p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
						Total
					</p>
					<p className="mt-0.5 text-2xl font-bold text-gray-900">
						{formatCurrency(order.total)}
					</p>
					<div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
						<span>Sub {formatCurrency(order.subtotal)}</span>
						<span className="h-1 w-1 rounded-full bg-gray-300" />
						<span>Tax {formatCurrency(order.tax)}</span>
						{Number(order.serviceCharge) > 0 && (
							<>
								<span className="h-1 w-1 rounded-full bg-gray-300" />
								<span>Svc {formatCurrency(order.serviceCharge)}</span>
							</>
						)}
					</div>
				</div>

				{/* ── Row 3: meta pills ── */}
				<div className="flex flex-wrap gap-1.5">
					{/* item count */}
					<span className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600">
						<PackageIcon className="h-3 w-3" />
						{order.itemCount ?? 0} item{(order.itemCount ?? 0) !== 1 ? 's' : ''}
					</span>

					{/* payment method */}
					{order.paymentMethod && (
						<span className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700">
							<PayIcon className="h-3 w-3" />
							{PAYMENT_LABEL[order.paymentMethod] ?? order.paymentMethod}
						</span>
					)}

					{/* status */}
					<OrderStatusBadge
						status={
							order.status as 'pending' | 'processing' | 'completed' | 'cancelled'
						}
					/>
				</div>

				{/* ── Row 4: customer + cashier ── */}
				<div className="space-y-1.5 border-t border-gray-100 pt-3">
					{/* customer */}
					<div className="flex items-center gap-2">
						{isMember ? (
							<BadgeCheckIcon className="h-3.5 w-3.5 shrink-0 text-green-600" />
						) : (
							<UserIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
						)}
						<div className="min-w-0">
							<span
								className={cn(
									'truncate text-xs font-medium',
									isMember ? 'text-green-700' : 'text-gray-600'
								)}
							>
								{displayCustomer ?? 'Walk-in customer'}
							</span>
							{order.customerPhone && (
								<span className="ml-1.5 text-[10px] text-gray-400">
									{order.customerPhone}
								</span>
							)}
						</div>
						{isMember && (
							<span className="ml-auto shrink-0 rounded-full bg-green-100 px-1.5 py-0.5 text-[9px] font-semibold text-green-700">
								MEMBER
							</span>
						)}
					</div>

					{/* cashier */}
					<div className="flex items-center gap-2">
						<ShieldCheckIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
						<span className="text-xs text-gray-500">{order.cashierName ?? '—'}</span>
						<span className="ml-auto text-[10px] text-gray-400">cashier</span>
					</div>

					{/* note */}
					{order.note && (
						<p className="truncate text-[11px] text-gray-400 italic" title={order.note}>
							&quot;{order.note}&quot;
						</p>
					)}
				</div>
			</div>
		</div>
	);
};

/* ── Table row ──────────────────────────────────────────────────────────── */
const OrderRow = ({
	order,
	onUpdate,
	isPending,
}: {
	order: Order;
	onUpdate: (id: string, status: string) => void;
	isPending?: boolean;
}) => {
	const { format: formatCurrency } = useCurrency();
	const cfg = STATUS_ICON[order.status] ?? STATUS_ICON.pending;
	const Icon = cfg.icon;
	const PayIcon = order.paymentMethod ? PAYMENT_ICON[order.paymentMethod] : null;
	const displayCustomer = order.customerName2 ?? order.customerName ?? 'Walk-in';
	const isMember = !!order.customerId && !!order.customerName2;

	return (
		<TableRow className="hover:bg-gray-50/60">
			<TableCell className="px-4 py-3">
				<div className="flex items-center gap-2.5">
					<div
						className={cn(
							'flex h-8 w-8 items-center justify-center rounded-lg',
							cfg.bg
						)}
					>
						<Icon className={cn('h-4 w-4', cfg.color)} />
					</div>
					<div>
						<p className="font-mono text-xs font-semibold text-gray-800">
							#{order.id.slice(0, 8).toUpperCase()}
						</p>
						<p className="text-[10px] text-gray-400">
							{format(new Date(order.createdAt), 'dd MMM, HH:mm')}
						</p>
					</div>
				</div>
			</TableCell>
			<TableCell className="px-4 py-3">
				<div className="flex items-center gap-1.5">
					{isMember ? (
						<BadgeCheckIcon className="h-3.5 w-3.5 shrink-0 text-green-600" />
					) : (
						<UserIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
					)}
					<div>
						<p
							className={cn(
								'text-xs font-medium',
								isMember ? 'text-green-700' : 'text-gray-600'
							)}
						>
							{displayCustomer}
						</p>
						{order.customerPhone && (
							<p className="text-[10px] text-gray-400">{order.customerPhone}</p>
						)}
					</div>
				</div>
			</TableCell>
			<TableCell className="px-4 py-3">
				{PayIcon && (
					<span className="flex items-center gap-1 text-xs text-gray-600">
						<PayIcon className="h-3.5 w-3.5" />
						{PAYMENT_LABEL[order.paymentMethod!]}
					</span>
				)}
			</TableCell>
			<TableCell className="px-4 py-3 text-xs text-gray-500">
				{order.cashierName ?? '—'}
			</TableCell>
			<TableCell className="px-4 py-3 text-xs text-gray-500">
				{order.itemCount ?? 0} item{(order.itemCount ?? 0) !== 1 ? 's' : ''}
			</TableCell>
			<TableCell className="px-4 py-3">
				<p className="text-sm font-bold text-green-700">{formatCurrency(order.total)}</p>
				{Number(order.serviceCharge) > 0 && (
					<p className="text-[10px] text-gray-400">
						Svc {formatCurrency(order.serviceCharge)}
					</p>
				)}
			</TableCell>
			<TableCell className="px-4 py-3">
				<OrderStatusBadge
					status={order.status as 'pending' | 'processing' | 'completed' | 'cancelled'}
				/>
			</TableCell>
			<TableCell className="px-4 py-3 text-right">
				<ActionMenu order={order} onUpdate={onUpdate} isPending={isPending} />
			</TableCell>
		</TableRow>
	);
};

/* ── Status counts widget ───────────────────────────────────────────────── */
const STATUS_WIDGET = [
	{
		key: 'pending',
		label: 'Pending',
		sub: 'Awaiting action',
		gradient: 'from-yellow-400 to-amber-500',
		glow: 'shadow-amber-100',
		text: 'text-amber-600',
		bar: 'bg-amber-400',
		icon: ClockIcon,
	},
	{
		key: 'processing',
		label: 'Processing',
		sub: 'Being prepared',
		gradient: 'from-blue-500 to-blue-600',
		glow: 'shadow-blue-100',
		text: 'text-blue-600',
		bar: 'bg-blue-500',
		icon: RefreshCwIcon,
	},
	{
		key: 'completed',
		label: 'Completed',
		sub: 'Successfully done',
		gradient: 'from-green-500 to-emerald-600',
		glow: 'shadow-green-100',
		text: 'text-green-600',
		bar: 'bg-green-500',
		icon: CheckCircleIcon,
	},
	{
		key: 'cancelled',
		label: 'Cancelled',
		sub: 'Did not proceed',
		gradient: 'from-red-400 to-rose-500',
		glow: 'shadow-red-100',
		text: 'text-red-500',
		bar: 'bg-red-400',
		icon: XCircleIcon,
	},
] as const;

const StatusCountsWidget = ({
	search,
	dateFrom,
	dateTo,
}: {
	search?: string;
	dateFrom?: string;
	dateTo?: string;
}) => {
	const trpc = useTRPC();
	const { data } = useQuery(trpc.orders.statusCounts.queryOptions({ search, dateFrom, dateTo }));

	const total = data ? data.pending + data.processing + data.completed + data.cancelled : 0;

	return (
		<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
			{STATUS_WIDGET.map(({ key, label, sub, gradient, glow, text, bar, icon: Icon }) => {
				const count = data ? data[key as keyof typeof data] : null;
				const pct = total > 0 && count != null ? Math.round((count / total) * 100) : 0;

				return (
					<div
						key={key}
						className={cn(
							'relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm',
							glow
						)}
					>
						{/* top colour bar */}
						<div className={cn('h-1 w-full bg-gradient-to-r', gradient)} />

						<div className="flex flex-col gap-3 p-4">
							{/* icon + label row */}
							<div className="flex items-center justify-between">
								<div
									className={cn(
										'flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm',
										gradient
									)}
								>
									<Icon className="h-5 w-5" />
								</div>
								<span
									className={cn(
										'rounded-full px-2 py-0.5 text-[10px] font-semibold',
										pct > 0 ? cn('bg-opacity-10', text) : 'text-gray-400'
									)}
								>
									{data ? `${pct}%` : '—'}
								</span>
							</div>

							{/* count */}
							<div>
								<p
									className={cn(
										'text-3xl leading-none font-extrabold tabular-nums',
										text
									)}
								>
									{count ?? '—'}
								</p>
								<p className="mt-1 text-xs font-semibold text-gray-700">{label}</p>
								<p className="text-[10px] text-gray-400">{sub}</p>
							</div>

							{/* progress bar */}
							<div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
								<div
									className={cn(
										'h-full rounded-full transition-all duration-500',
										bar
									)}
									style={{ width: `${pct}%` }}
								/>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
};

/* ── Main content ───────────────────────────────────────────────────────── */
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

	if (data.items.length === 0) {
		return (
			<div className="flex flex-1 flex-col gap-4 p-6">
				<StatusCountsWidget
					search={filters.search || undefined}
					dateFrom={filters.dateFrom ? toLocalDate(filters.dateFrom) : undefined}
					dateTo={filters.dateTo ? toLocalDate(filters.dateTo) : undefined}
				/>
				<div className="flex flex-1 flex-col items-center justify-center gap-4 py-16">
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
		<div className="flex flex-1 flex-col gap-4 p-6">
			<StatusCountsWidget
				search={filters.search || undefined}
				dateFrom={filters.dateFrom ? toLocalDate(filters.dateFrom) : undefined}
				dateTo={filters.dateTo ? toLocalDate(filters.dateTo) : undefined}
			/>

			<p className="text-xs font-medium tracking-wider text-gray-400 uppercase">
				{data.total} order{data.total !== 1 ? 's' : ''}
			</p>

			{viewMode === 'grid' ? (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
				<div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
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

/* ── Skeleton ───────────────────────────────────────────────────────────── */
export const OrdersViewLoading = () => (
	<div className="flex flex-col gap-4 p-6">
		<Skeleton className="h-4 w-24 rounded" />
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{Array.from({ length: 8 }).map((_, i) => (
				<div
					key={i}
					className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.07)]"
				>
					<Skeleton className="h-1.5 w-full rounded-none" />
					<div className="flex flex-col gap-3 p-4">
						<div className="flex items-start justify-between">
							<div className="flex items-center gap-2.5">
								<Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
								<div className="space-y-1.5">
									<Skeleton className="h-4 w-28 rounded" />
									<Skeleton className="h-3 w-24 rounded" />
								</div>
							</div>
							<Skeleton className="h-8 w-8 rounded-lg" />
						</div>
						<div className="space-y-2 rounded-xl bg-gray-50 px-4 py-3">
							<Skeleton className="h-2.5 w-10 rounded" />
							<Skeleton className="h-7 w-32 rounded" />
							<Skeleton className="h-3 w-40 rounded" />
						</div>
						<div className="flex gap-1.5">
							<Skeleton className="h-6 w-16 rounded-full" />
							<Skeleton className="h-6 w-16 rounded-full" />
							<Skeleton className="h-6 w-20 rounded-full" />
						</div>
						<div className="space-y-2 border-t border-gray-100 pt-3">
							<Skeleton className="h-3.5 w-full rounded" />
							<Skeleton className="h-3.5 w-3/4 rounded" />
						</div>
					</div>
				</div>
			))}
		</div>
	</div>
);

/* ── Root view ──────────────────────────────────────────────────────────── */
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
