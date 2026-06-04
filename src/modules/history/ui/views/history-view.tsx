'use client';

import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useCurrency } from '@/modules/company/hooks/use-currency';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { OrderStatusBadge } from '@/modules/orders/ui/components/order-status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	HistoryIcon,
	SearchIcon,
	XIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	TrendingUpIcon,
	ReceiptIcon,
	CoinsIcon,
	WalletIcon,
	FilterIcon,
	BanknoteIcon,
	CreditCardIcon,
	QrCodeIcon,
	ArrowRightLeftIcon,
	UserIcon,
	BadgeCheckIcon,
	ShieldCheckIcon,
	PackageIcon,
	DownloadIcon,
	Loader2Icon,
	CalendarIcon,
} from 'lucide-react';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorState from '@/components/error-state';

/* ── Date Range Picker ─────────────────────────────────────────────────── */
const PRESETS = [
	{
		label: 'Today',
		get: () => {
			const d = format(new Date(), 'yyyy-MM-dd');
			return { from: d, to: d };
		},
	},
	{
		label: 'Yesterday',
		get: () => {
			const d = new Date();
			d.setDate(d.getDate() - 1);
			const s = format(d, 'yyyy-MM-dd');
			return { from: s, to: s };
		},
	},
	{
		label: 'Last 7 days',
		get: () => {
			const to = new Date();
			const from = new Date();
			from.setDate(from.getDate() - 6);
			return { from: format(from, 'yyyy-MM-dd'), to: format(to, 'yyyy-MM-dd') };
		},
	},
	{
		label: 'This month',
		get: () => {
			const now = new Date();
			const from = new Date(now.getFullYear(), now.getMonth(), 1);
			return { from: format(from, 'yyyy-MM-dd'), to: format(now, 'yyyy-MM-dd') };
		},
	},
];

const DateRangePicker = ({
	from,
	to,
	onChange,
}: {
	from: string;
	to: string;
	onChange: (from: string, to: string) => void;
}) => {
	const [open, setOpen] = useState(false);

	const range = {
		from: from ? new Date(from + 'T00:00:00') : undefined,
		to: to ? new Date(to + 'T00:00:00') : undefined,
	};

	const label =
		from && to && from === to
			? format(range.from!, 'dd MMM yyyy')
			: from && to
				? `${format(range.from!, 'dd MMM yyyy')} – ${format(range.to!, 'dd MMM yyyy')}`
				: from
					? `From ${format(range.from!, 'dd MMM yyyy')}`
					: 'Pick date range';

	const applyPreset = (preset: (typeof PRESETS)[number]) => {
		const { from, to } = preset.get();
		onChange(from, to);
		setOpen(false);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className={cn(
						'h-9 min-w-[200px] justify-start gap-2 text-sm font-normal shadow-none',
						!from && !to && 'text-muted-foreground'
					)}
				>
					<CalendarIcon className="h-3.5 w-3.5 shrink-0" />
					{label}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="end">
				{/* Presets */}
				<div className="flex gap-1.5 border-b px-3 py-2.5">
					{PRESETS.map((p) => (
						<Button
							key={p.label}
							variant="outline"
							size="sm"
							className="h-7 px-2.5 text-xs"
							onClick={() => applyPreset(p)}
						>
							{p.label}
						</Button>
					))}
				</div>
				<Calendar
					mode="range"
					selected={range}
					onSelect={(r) => {
						onChange(
							r?.from ? format(r.from, 'yyyy-MM-dd') : '',
							r?.to ? format(r.to, 'yyyy-MM-dd') : ''
						);
						if (r?.from && r?.to) setOpen(false);
					}}
					numberOfMonths={2}
					initialFocus
				/>
				{(from || to) && (
					<div className="border-t px-3 py-2">
						<Button
							variant="ghost"
							size="sm"
							className="h-7 w-full text-xs text-muted-foreground"
							onClick={() => {
								onChange('', '');
								setOpen(false);
							}}
						>
							Clear range
						</Button>
					</div>
				)}
			</PopoverContent>
		</Popover>
	);
};

const STATUS_OPTIONS = [
	{ value: 'all', label: 'All Statuses' },
	{ value: 'pending', label: 'Pending' },
	{ value: 'processing', label: 'Processing' },
	{ value: 'completed', label: 'Completed' },
	{ value: 'cancelled', label: 'Cancelled' },
] as const;

const PAYMENT_OPTIONS = [
	{ value: 'all', label: 'All Payments' },
	{ value: 'cash', label: 'Cash' },
	{ value: 'card', label: 'Card' },
	{ value: 'qris', label: 'QRIS' },
	{ value: 'transfer', label: 'Transfer' },
] as const;

const PAYMENT_ICON: Record<string, React.ElementType> = {
	cash: BanknoteIcon,
	card: CreditCardIcon,
	qris: QrCodeIcon,
	transfer: ArrowRightLeftIcon,
};

const PAGE_SIZE = 15;

/* ── Summary KPI card ──────────────────────────────────────────────────── */
const KpiCard = ({
	label,
	value,
	sub,
	icon: Icon,
	accent,
}: {
	label: string;
	value: string;
	sub?: string;
	icon: React.ElementType;
	accent: string;
}) => (
	<div className="flex items-center gap-4 rounded-2xl bg-white p-5">
		<div
			className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', accent)}
		>
			<Icon className="h-5 w-5 text-white" />
		</div>
		<div className="min-w-0">
			<p className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
				{label}
			</p>
			<p className="truncate text-xl font-bold text-gray-900">{value}</p>
			{sub && <p className="text-xs text-gray-400">{sub}</p>}
		</div>
	</div>
);

/* ── Main content ──────────────────────────────────────────────────────── */
const HistoryContent = () => {
	const trpc = useTRPC();
	const { format: formatCurrency } = useCurrency();

	const [page, setPage] = useState(1);
	const [search, setSearch] = useState('');
	const [searchInput, setSearchInput] = useState('');
	const [status, setStatus] = useState<string>('all');
	const [paymentMethod, setPaymentMethod] = useState<string>('all');
	const [dateFrom, setDateFrom] = useState('');
	const [dateTo, setDateTo] = useState('');

	const filters = {
		page,
		pageSize: PAGE_SIZE,
		search: search || undefined,
		status: status !== 'all' ? (status as never) : undefined,
		paymentMethod: paymentMethod !== 'all' ? (paymentMethod as never) : undefined,
		dateFrom: dateFrom || undefined,
		dateTo: dateTo || undefined,
	};

	const { data } = useSuspenseQuery(trpc.history.getMany.queryOptions(filters));
	const { data: summary } = useQuery(
		trpc.history.summary.queryOptions({
			dateFrom: dateFrom || undefined,
			dateTo: dateTo || undefined,
			status: status !== 'all' ? (status as never) : undefined,
		})
	);

	const exportFilters = {
		search: search || undefined,
		status: status !== 'all' ? (status as never) : undefined,
		paymentMethod: paymentMethod !== 'all' ? (paymentMethod as never) : undefined,
		dateFrom: dateFrom || undefined,
		dateTo: dateTo || undefined,
	};
	const [exporting, setExporting] = useState(false);
	const { refetch: fetchExport } = useQuery({
		...trpc.history.export.queryOptions(exportFilters),
		enabled: false,
	});

	const handleExport = async () => {
		setExporting(true);
		try {
			const { data: rows } = await fetchExport();
			if (!rows?.length) return;

			const hasService = rows.some((r) => Number(r.serviceCharge) > 0);
			const headers = [
				'Order ID',
				'Date',
				'Time',
				'Customer',
				'Customer Phone',
				'Cashier',
				'Payment Method',
				'Items',
				'Subtotal',
				'Tax',
				...(hasService ? ['Service Charge'] : []),
				'Total',
				'Status',
				'Note',
			];

			const escape = (v: string | number | null | undefined) => {
				const s = String(v ?? '');
				return s.includes(',') || s.includes('"') || s.includes('\n')
					? `"${s.replace(/"/g, '""')}"`
					: s;
			};

			const csvRows = rows.map((o) => {
				const dt = new Date(o.createdAt);
				const customer = o.customerName2 ?? o.customerName ?? 'Walk-in';
				return [
					escape(`#${o.id.slice(0, 8).toUpperCase()}`),
					escape(format(dt, 'yyyy-MM-dd')),
					escape(format(dt, 'HH:mm:ss')),
					escape(customer),
					escape(o.customerPhone),
					escape(o.cashierName),
					escape(o.paymentMethod),
					escape(o.itemCount),
					escape(o.subtotal),
					escape(o.tax),
					...(hasService ? [escape(o.serviceCharge)] : []),
					escape(o.total),
					escape(o.status),
					escape(o.note),
				].join(',');
			});

			const csv = [headers.join(','), ...csvRows].join('\n');
			const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			const filename = `orders_${dateFrom || 'all'}_${dateTo || 'all'}.csv`;
			a.href = url;
			a.download = filename;
			a.click();
			URL.revokeObjectURL(url);
		} finally {
			setExporting(false);
		}
	};

	const hasActiveFilters =
		search || status !== 'all' || paymentMethod !== 'all' || dateFrom || dateTo;

	const handleSearch = () => {
		setSearch(searchInput);
		setPage(1);
	};

	const handleClearFilters = () => {
		setSearch('');
		setSearchInput('');
		setStatus('all');
		setPaymentMethod('all');
		setDateFrom('');
		setDateTo('');
		setPage(1);
	};

	const showServiceCol = data.items.some((o) => Number(o.serviceCharge) > 0);

	return (
		<div className="flex flex-1 flex-col">
			{/* Header */}
			<div className="shrink-0 border-b bg-white px-6 py-5">
				<div className="flex items-center justify-between gap-4">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-700">
							<HistoryIcon className="h-5 w-5 text-white" />
						</div>
						<div>
							<h1 className="text-base font-semibold text-gray-900">Order History</h1>
							<p className="text-xs text-gray-400">
								Browse, filter and export all past transactions
							</p>
						</div>
					</div>
					<Button
						onClick={handleExport}
						disabled={exporting}
						variant="outline"
						size="sm"
						className="gap-2 border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
					>
						{exporting ? (
							<Loader2Icon className="h-4 w-4 animate-spin" />
						) : (
							<DownloadIcon className="h-4 w-4" />
						)}
						{exporting ? 'Exporting…' : 'Export CSV'}
					</Button>
				</div>
			</div>

			<div className="flex flex-1 flex-col gap-6 bg-muted/40 p-6">
				{/* KPI row */}
				<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
					<KpiCard
						label="Total Orders"
						value={String(summary?.orderCount ?? '—')}
						sub="excl. cancelled"
						icon={ReceiptIcon}
						accent="bg-blue-600"
					/>
					<KpiCard
						label="Revenue"
						value={summary ? formatCurrency(summary.revenue) : '—'}
						sub="incl. tax & service"
						icon={TrendingUpIcon}
						accent="bg-green-600"
					/>
					<KpiCard
						label="Tax Collected"
						value={summary ? formatCurrency(summary.taxSum) : '—'}
						icon={CoinsIcon}
						accent="bg-amber-500"
					/>
					<KpiCard
						label="Service Charge"
						value={summary ? formatCurrency(summary.serviceSum) : '—'}
						icon={WalletIcon}
						accent="bg-purple-600"
					/>
				</div>

				{/* Filters */}
				<div className="rounded-2xl border bg-white p-4">
					<div className="flex flex-wrap items-center gap-3">
						<FilterIcon className="h-4 w-4 shrink-0 text-gray-400" />

						{/* Search */}
						<div className="relative min-w-[200px] flex-1">
							<SearchIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
							<Input
								value={searchInput}
								onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
								onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
								placeholder="Order ID..."
								className="h-9 pl-9 font-mono text-sm uppercase shadow-none focus-visible:ring-0"
							/>
						</div>

						{/* Status */}
						<Select
							value={status}
							onValueChange={(v) => {
								setStatus(v);
								setPage(1);
							}}
						>
							<SelectTrigger className="h-9 w-40 shadow-none">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{STATUS_OPTIONS.map((o) => (
									<SelectItem key={o.value} value={o.value}>
										{o.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						{/* Payment */}
						<Select
							value={paymentMethod}
							onValueChange={(v) => {
								setPaymentMethod(v);
								setPage(1);
							}}
						>
							<SelectTrigger className="h-9 w-40 shadow-none">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{PAYMENT_OPTIONS.map((o) => (
									<SelectItem key={o.value} value={o.value}>
										{o.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						{/* Date range */}
						<DateRangePicker
							from={dateFrom}
							to={dateTo}
							onChange={(f, t) => {
								setDateFrom(f);
								setDateTo(t);
								setPage(1);
							}}
						/>

						<Button
							onClick={handleSearch}
							size="sm"
							className="h-9 bg-green-600 hover:bg-green-700"
						>
							<SearchIcon className="h-3.5 w-3.5" />
						</Button>

						{hasActiveFilters && (
							<Button
								onClick={handleClearFilters}
								size="sm"
								variant="outline"
								className="h-9 gap-1.5"
							>
								<XIcon className="h-3.5 w-3.5" />
								Clear
							</Button>
						)}
					</div>
				</div>

				{/* Table */}
				<div className="overflow-hidden rounded-2xl border bg-white">
					<Table>
						<TableHeader>
							<TableRow className="bg-gray-50/60 hover:bg-gray-50/60">
								<TableHead className="px-4 py-3 text-xs">Order</TableHead>
								<TableHead className="px-4 py-3 text-xs">Date</TableHead>
								<TableHead className="px-4 py-3 text-xs">Customer</TableHead>
								<TableHead className="px-4 py-3 text-xs">Cashier</TableHead>
								<TableHead className="px-4 py-3 text-xs">Payment</TableHead>
								<TableHead className="px-4 py-3 text-xs">Items</TableHead>
								<TableHead className="px-4 py-3 text-xs">Subtotal</TableHead>
								<TableHead className="px-4 py-3 text-xs">Tax</TableHead>
								{showServiceCol && (
									<TableHead className="px-4 py-3 text-xs">Service</TableHead>
								)}
								<TableHead className="px-4 py-3 text-xs font-semibold text-green-700">
									Total
								</TableHead>
								<TableHead className="px-4 py-3 text-xs">Status</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{data.items.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={showServiceCol ? 11 : 10}
										className="py-16 text-center"
									>
										<div className="flex flex-col items-center gap-3">
											<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">
												<HistoryIcon className="h-6 w-6 text-gray-400" />
											</div>
											<p className="text-sm font-medium text-gray-500">
												No orders match your filters
											</p>
										</div>
									</TableCell>
								</TableRow>
							) : (
								data.items.map((order) => {
									const PayIcon = order.paymentMethod
										? PAYMENT_ICON[order.paymentMethod]
										: null;
									const isMember = !!order.customerId && !!order.customerName2;
									const displayCustomer =
										order.customerName2 ?? order.customerName ?? 'Walk-in';

									return (
										<TableRow key={order.id} className="hover:bg-green-50/30">
											<TableCell className="px-4 py-3">
												<span className="font-mono text-xs font-bold text-gray-800">
													#{order.id.slice(0, 8).toUpperCase()}
												</span>
											</TableCell>
											<TableCell className="px-4 py-3 text-xs text-gray-500">
												{format(new Date(order.createdAt), 'dd MMM yyyy')}
												<br />
												<span className="text-[10px] text-gray-400">
													{format(new Date(order.createdAt), 'HH:mm')}
												</span>
											</TableCell>
											<TableCell className="px-4 py-3">
												<div className="flex items-center gap-1.5">
													{isMember ? (
														<BadgeCheckIcon className="h-3.5 w-3.5 shrink-0 text-green-600" />
													) : (
														<UserIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
													)}
													<span
														className={cn(
															'text-xs font-medium',
															isMember
																? 'text-green-700'
																: 'text-gray-600'
														)}
													>
														{displayCustomer}
													</span>
												</div>
											</TableCell>
											<TableCell className="px-4 py-3">
												<div className="flex items-center gap-1.5">
													<ShieldCheckIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
													<span className="text-xs text-gray-600">
														{order.cashierName ?? '—'}
													</span>
												</div>
											</TableCell>
											<TableCell className="px-4 py-3">
												{PayIcon ? (
													<span className="flex items-center gap-1 text-xs text-gray-600">
														<PayIcon className="h-3.5 w-3.5" />
														{order.paymentMethod}
													</span>
												) : (
													<span className="text-xs text-gray-400">—</span>
												)}
											</TableCell>
											<TableCell className="px-4 py-3">
												<span className="flex items-center gap-1 text-xs text-gray-600">
													<PackageIcon className="h-3.5 w-3.5" />
													{order.itemCount ?? 0}
												</span>
											</TableCell>
											<TableCell className="px-4 py-3 font-mono text-xs text-gray-600">
												{formatCurrency(order.subtotal)}
											</TableCell>
											<TableCell className="px-4 py-3 font-mono text-xs text-amber-600">
												{formatCurrency(order.tax)}
											</TableCell>
											{showServiceCol && (
												<TableCell className="px-4 py-3 font-mono text-xs text-purple-600">
													{Number(order.serviceCharge) > 0
														? formatCurrency(order.serviceCharge)
														: '—'}
												</TableCell>
											)}
											<TableCell className="px-4 py-3 font-mono text-sm font-bold text-green-700">
												{formatCurrency(order.total)}
											</TableCell>
											<TableCell className="px-4 py-3">
												<OrderStatusBadge
													status={
														order.status as
															| 'pending'
															| 'processing'
															| 'completed'
															| 'cancelled'
													}
												/>
											</TableCell>
										</TableRow>
									);
								})
							)}
						</TableBody>
					</Table>

					{/* Pagination footer */}
					{data.totalPages > 1 && (
						<>
							<Separator />
							<div className="flex items-center justify-between px-4 py-3">
								<p className="text-xs text-gray-400">
									{data.total} orders · page {page} of {data.totalPages}
								</p>
								<div className="flex items-center gap-2">
									<Button
										size="sm"
										variant="outline"
										className="h-8 w-8 p-0"
										disabled={page <= 1}
										onClick={() => setPage((p) => p - 1)}
									>
										<ChevronLeftIcon className="h-4 w-4" />
									</Button>
									<span className="min-w-[3rem] text-center text-xs font-medium">
										{page} / {data.totalPages}
									</span>
									<Button
										size="sm"
										variant="outline"
										className="h-8 w-8 p-0"
										disabled={page >= data.totalPages}
										onClick={() => setPage((p) => p + 1)}
									>
										<ChevronRightIcon className="h-4 w-4" />
									</Button>
								</div>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
};

/* ── Skeleton ──────────────────────────────────────────────────────────── */
export const HistoryViewLoading = () => (
	<div className="flex flex-1 flex-col">
		<div className="border-b bg-white px-6 py-5">
			<div className="flex items-center gap-3">
				<Skeleton className="h-10 w-10 rounded-xl" />
				<div className="space-y-1.5">
					<Skeleton className="h-4 w-32 rounded" />
					<Skeleton className="h-3 w-56 rounded" />
				</div>
			</div>
		</div>
		<div className="flex flex-1 flex-col gap-6 bg-muted/40 p-6">
			<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<Skeleton key={i} className="h-24 rounded-2xl" />
				))}
			</div>
			<Skeleton className="h-16 rounded-2xl" />
			<Skeleton className="h-96 rounded-2xl" />
		</div>
	</div>
);

/* ── Root ──────────────────────────────────────────────────────────────── */
const HistoryView = () => (
	<div className="flex flex-1 flex-col">
		<ErrorBoundary
			fallback={
				<ErrorState title="Error loading history" description="Please try again later." />
			}
		>
			<Suspense fallback={<HistoryViewLoading />}>
				<HistoryContent />
			</Suspense>
		</ErrorBoundary>
	</div>
);

export default HistoryView;
