'use client';

import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useCurrency } from '@/modules/company/hooks/use-currency';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { HistoryViewLoading } from './history-view-loading';
import {
	HistoryIcon,
	DownloadIcon,
	Loader2Icon,
	TrendingUpIcon,
	ReceiptIcon,
	CoinsIcon,
	WalletIcon,
} from 'lucide-react';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorState from '@/components/error-state';
import { HistoryKpiCard } from '../components/history-kpi-card';
import { HistoryFilters } from '../components/history-filters';
import { HistoryTable } from '../components/history-table';

const PAGE_SIZE = 15;

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
			a.href = url;
			a.download = `orders_${dateFrom || 'all'}_${dateTo || 'all'}.csv`;
			a.click();
			URL.revokeObjectURL(url);
		} finally {
			setExporting(false);
		}
	};

	const hasActiveFilters = !!(
		search ||
		status !== 'all' ||
		paymentMethod !== 'all' ||
		dateFrom ||
		dateTo
	);

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
			<div className="shrink-0 border-b bg-white px-4 py-4 md:px-6 md:py-5">
				<div className="flex items-center justify-between gap-3">
					<div className="flex items-center gap-3">
						<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-700 md:h-10 md:w-10">
							<HistoryIcon className="h-4 w-4 text-white md:h-5 md:w-5" />
						</div>
						<div>
							<h1 className="text-sm font-semibold text-gray-900 md:text-base">
								Order History
							</h1>
							<p className="hidden text-xs text-gray-400 sm:block">
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
						<span className="hidden sm:inline">
							{exporting ? 'Exporting…' : 'Export CSV'}
						</span>
					</Button>
				</div>
			</div>

			<div className="flex flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-6 md:p-6">
				{/* KPI row */}
				<div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
					<HistoryKpiCard
						label="Total Orders"
						value={String(summary?.orderCount ?? '—')}
						sub="excl. cancelled"
						icon={ReceiptIcon}
						accent="bg-blue-600"
					/>
					<HistoryKpiCard
						label="Revenue"
						value={summary ? formatCurrency(summary.revenue) : '—'}
						sub="incl. tax & service"
						icon={TrendingUpIcon}
						accent="bg-green-600"
					/>
					<HistoryKpiCard
						label="Tax Collected"
						value={summary ? formatCurrency(summary.taxSum) : '—'}
						icon={CoinsIcon}
						accent="bg-amber-500"
					/>
					<HistoryKpiCard
						label="Service Charge"
						value={summary ? formatCurrency(summary.serviceSum) : '—'}
						icon={WalletIcon}
						accent="bg-purple-600"
					/>
				</div>

				{/* Filters */}
				<HistoryFilters
					searchInput={searchInput}
					status={status}
					paymentMethod={paymentMethod}
					dateFrom={dateFrom}
					dateTo={dateTo}
					hasActiveFilters={hasActiveFilters}
					onSearchInputChange={setSearchInput}
					onSearch={handleSearch}
					onStatusChange={(v) => {
						setStatus(v);
						setPage(1);
					}}
					onPaymentChange={(v) => {
						setPaymentMethod(v);
						setPage(1);
					}}
					onDateRangeChange={(f, t) => {
						setDateFrom(f);
						setDateTo(t);
						setPage(1);
					}}
					onClear={handleClearFilters}
				/>

				{/* Table */}
				<HistoryTable
					items={data.items}
					total={data.total}
					totalPages={data.totalPages}
					page={page}
					showServiceCol={showServiceCol}
					formatCurrency={formatCurrency}
					onPageChange={setPage}
				/>
			</div>
		</div>
	);
};

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
