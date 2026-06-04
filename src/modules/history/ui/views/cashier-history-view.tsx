'use client';

import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useCurrency } from '@/modules/company/hooks/use-currency';
import {
	format,
	isToday,
	subDays,
	startOfDay,
	endOfDay,
	startOfWeek,
	startOfMonth,
	endOfMonth,
} from 'date-fns';
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
	PackageIcon,
	DownloadIcon,
	Loader2Icon,
	ShieldCheckIcon,
	CalendarIcon,
} from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorState from '@/components/error-state';

const DATE_PRESETS = [
	{
		label: 'Today',
		getRange: () => ({ from: startOfDay(new Date()), to: endOfDay(new Date()) }),
	},
	{
		label: 'Yesterday',
		getRange: () => {
			const d = subDays(new Date(), 1);
			return { from: startOfDay(d), to: endOfDay(d) };
		},
	},
	{
		label: 'Last 7 days',
		getRange: () => ({ from: startOfDay(subDays(new Date(), 6)), to: endOfDay(new Date()) }),
	},
	{
		label: 'This week',
		getRange: () => ({
			from: startOfWeek(new Date(), { weekStartsOn: 1 }),
			to: endOfDay(new Date()),
		}),
	},
	{
		label: 'This month',
		getRange: () => ({ from: startOfMonth(new Date()), to: endOfDay(new Date()) }),
	},
	{
		label: 'Last month',
		getRange: () => {
			const d = subDays(startOfMonth(new Date()), 1);
			return { from: startOfMonth(d), to: endOfMonth(d) };
		},
	},
];

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
	<div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm">
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

const CashierHistoryContent = () => {
	const trpc = useTRPC();
	const { format: formatCurrency } = useCurrency();

	const [page, setPage] = useState(1);
	const [search, setSearch] = useState('');
	const [searchInput, setSearchInput] = useState('');
	const [status, setStatus] = useState<string>('all');
	const [paymentMethod, setPaymentMethod] = useState<string>('all');
	const [dateFrom, setDateFrom] = useState<Date | null>(null);
	const [dateTo, setDateTo] = useState<Date | null>(null);
	const [calOpen, setCalOpen] = useState(false);

	const dateFromStr = dateFrom ? format(dateFrom, 'yyyy-MM-dd') : undefined;
	const dateToStr = dateTo ? format(dateTo, 'yyyy-MM-dd') : undefined;

	const filters = {
		page,
		pageSize: PAGE_SIZE,
		search: search || undefined,
		status: status !== 'all' ? (status as never) : undefined,
		paymentMethod: paymentMethod !== 'all' ? (paymentMethod as never) : undefined,
		dateFrom: dateFromStr,
		dateTo: dateToStr,
	};

	const { data } = useSuspenseQuery(trpc.history.cashierHistory.queryOptions(filters));
	const { data: summary } = useQuery(
		trpc.history.cashierSummary.queryOptions({
			dateFrom: dateFromStr,
			dateTo: dateToStr,
			status: status !== 'all' ? (status as never) : undefined,
		})
	);

	const [exporting, setExporting] = useState(false);
	const { refetch: fetchExport } = useQuery({
		...trpc.history.cashierHistory.queryOptions({
			...filters,
			page: 1,
			pageSize: 9999,
		}),
		enabled: false,
	});

	const handleExport = async () => {
		setExporting(true);
		try {
			const { data: result } = await fetchExport();
			const rows = result?.items;
			if (!rows?.length) return;

			const hasService = rows.some((r) => Number(r.serviceCharge) > 0);
			const headers = [
				'Order ID',
				'Date',
				'Time',
				'Customer',
				'Customer Phone',
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
			a.href = url;
			a.download = `my_orders_${dateFromStr || 'all'}_${dateToStr || 'all'}.csv`;
			a.click();
			URL.revokeObjectURL(url);
		} finally {
			setExporting(false);
		}
	};

	const hasDateFilter = !!(dateFrom || dateTo);
	const hasActiveFilters = search || status !== 'all' || paymentMethod !== 'all' || hasDateFilter;

	const handleSearch = () => {
		setSearch(searchInput);
		setPage(1);
	};

	const handleClearFilters = () => {
		setSearch('');
		setSearchInput('');
		setStatus('all');
		setPaymentMethod('all');
		setDateFrom(null);
		setDateTo(null);
		setPage(1);
	};

	const dateLabel = () => {
		if (!dateFrom && !dateTo) return 'All dates';
		if (dateFrom && dateTo) {
			if (isToday(dateFrom) && isToday(dateTo)) return 'Today';
			if (dateFrom.toDateString() === dateTo.toDateString())
				return format(dateFrom, 'dd MMM yyyy');
			return `${format(dateFrom, 'dd MMM')} – ${format(dateTo, 'dd MMM yyyy')}`;
		}
		if (dateFrom) return `From ${format(dateFrom, 'dd MMM yyyy')}`;
		return `Until ${format(dateTo!, 'dd MMM yyyy')}`;
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
							<h1 className="text-base font-semibold text-gray-900">
								My Order History
							</h1>
							<p className="text-xs text-gray-400">All orders you have processed</p>
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
						label="My Orders"
						value={String(summary?.orderCount ?? '—')}
						sub="excl. cancelled"
						icon={ReceiptIcon}
						accent="bg-blue-600"
					/>
					<KpiCard
						label="My Revenue"
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
				<div className="rounded-2xl border bg-white p-4 shadow-sm">
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

						{/* Date range picker */}
						<Popover open={calOpen} onOpenChange={setCalOpen}>
							<PopoverTrigger asChild>
								<button
									className={cn(
										'flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-medium transition-colors',
										hasDateFilter
											? 'border-green-500 bg-green-50 text-green-700'
											: 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
									)}
								>
									<CalendarIcon className="h-3.5 w-3.5 shrink-0" />
									<span>{dateLabel()}</span>
									{hasDateFilter && (
										<span
											className="ml-1 text-green-500 hover:text-green-700"
											onClick={(e) => {
												e.stopPropagation();
												setDateFrom(null);
												setDateTo(null);
												setPage(1);
											}}
										>
											<XIcon className="h-3 w-3" />
										</span>
									)}
								</button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0" align="end">
								<div className="flex">
									{/* Presets */}
									<div className="flex flex-col gap-0.5 border-r p-3">
										<p className="mb-1.5 px-2 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
											Quick select
										</p>
										{DATE_PRESETS.map((p) => (
											<button
												key={p.label}
												onClick={() => {
													const { from, to } = p.getRange();
													setDateFrom(from);
													setDateTo(to);
													setPage(1);
													setCalOpen(false);
												}}
												className="rounded-md px-3 py-1.5 text-left text-xs text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
											>
												{p.label}
											</button>
										))}
										{hasDateFilter && (
											<button
												onClick={() => {
													setDateFrom(null);
													setDateTo(null);
													setPage(1);
													setCalOpen(false);
												}}
												className="mt-1 rounded-md px-3 py-1.5 text-left text-xs text-red-500 transition-colors hover:bg-red-50"
											>
												Clear dates
											</button>
										)}
									</div>
									{/* Calendar */}
									<div>
										<Calendar
											mode="range"
											selected={{
												from: dateFrom ?? undefined,
												to: dateTo ?? undefined,
											}}
											onSelect={(range: DateRange | undefined) => {
												setDateFrom(range?.from ?? null);
												setDateTo(range?.to ?? null);
												setPage(1);
											}}
											numberOfMonths={2}
											initialFocus
											disabled={(d) => d > new Date()}
										/>
										{dateFrom && dateTo && (
											<div className="border-t px-4 py-2 text-xs text-gray-500">
												{format(dateFrom, 'dd MMM yyyy')} →{' '}
												{format(dateTo, 'dd MMM yyyy')}
											</div>
										)}
									</div>
								</div>
							</PopoverContent>
						</Popover>

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
				<div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
					<Table>
						<TableHeader>
							<TableRow className="bg-gray-50/60 hover:bg-gray-50/60">
								<TableHead className="px-4 py-3 text-xs">Order</TableHead>
								<TableHead className="px-4 py-3 text-xs">Date</TableHead>
								<TableHead className="px-4 py-3 text-xs">Customer</TableHead>
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
										colSpan={showServiceCol ? 10 : 9}
										className="py-16 text-center"
									>
										<div className="flex flex-col items-center gap-3">
											<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">
												<ShieldCheckIcon className="h-6 w-6 text-gray-400" />
											</div>
											<p className="text-sm font-medium text-gray-500">
												No orders found
											</p>
											<p className="text-xs text-gray-400">
												Orders you process will appear here
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

export const CashierHistoryViewLoading = () => (
	<div className="flex flex-1 flex-col">
		<div className="border-b bg-white px-6 py-5">
			<div className="flex items-center gap-3">
				<Skeleton className="h-10 w-10 rounded-xl" />
				<div className="space-y-1.5">
					<Skeleton className="h-4 w-40 rounded" />
					<Skeleton className="h-3 w-52 rounded" />
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

const CashierHistoryView = () => (
	<div className="flex flex-1 flex-col">
		<ErrorBoundary
			fallback={
				<ErrorState title="Error loading history" description="Please try again later." />
			}
		>
			<Suspense fallback={<CashierHistoryViewLoading />}>
				<CashierHistoryContent />
			</Suspense>
		</ErrorBoundary>
	</div>
);

export default CashierHistoryView;
