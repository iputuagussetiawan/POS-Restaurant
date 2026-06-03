'use client';

import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
	TrendingUpIcon,
	ShoppingCartIcon,
	UsersIcon,
	PackageIcon,
	TrendingDownIcon,
	MinusIcon,
	BanknoteIcon,
	CreditCardIcon,
	QrCodeIcon,
	ArrowRightLeftIcon,
	ClockIcon,
	CheckCircleIcon,
	XCircleIcon,
	RefreshCwIcon,
} from 'lucide-react';
import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	BarChart,
	Bar,
	PieChart,
	Pie,
	Cell,
	Legend,
} from 'recharts';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { OrderStatusBadge } from '@/modules/orders/ui/components/order-status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorState from '@/components/error-state';

function formatUSD(n: number | string) {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(Number(n));
}

function pct(a: number, b: number) {
	if (b === 0) return null;
	return ((a - b) / b) * 100;
}

const PAYMENT_COLORS: Record<string, string> = {
	cash: '#16a34a',
	card: '#2563eb',
	qris: '#9333ea',
	transfer: '#ea580c',
};
const PAYMENT_ICONS: Record<string, React.ElementType> = {
	cash: BanknoteIcon,
	card: CreditCardIcon,
	qris: QrCodeIcon,
	transfer: ArrowRightLeftIcon,
};
const STATUS_COLORS: Record<string, string> = {
	pending: '#f59e0b',
	processing: '#3b82f6',
	completed: '#16a34a',
	cancelled: '#ef4444',
};
const PIE_FALLBACK_COLORS = ['#16a34a', '#2563eb', '#9333ea', '#ea580c', '#f59e0b'];

/* ── KPI Card ───────────────────────────────────────────────────────────── */
const KpiCard = ({
	title,
	value,
	sub,
	icon: Icon,
	trend,
	iconBg,
}: {
	title: string;
	value: string;
	sub?: string;
	icon: React.ElementType;
	trend?: number | null;
	iconBg: string;
}) => (
	<div className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm">
		<div className="flex items-center justify-between">
			<p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">{title}</p>
			<div className={cn('flex h-9 w-9 items-center justify-center rounded-xl', iconBg)}>
				<Icon className="h-5 w-5 text-white" />
			</div>
		</div>
		<div>
			<p className="text-2xl font-bold text-gray-900">{value}</p>
			{sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
		</div>
		{trend !== null && trend !== undefined && (
			<div
				className={cn(
					'flex items-center gap-1 text-xs font-semibold',
					trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-500' : 'text-gray-400'
				)}
			>
				{trend > 0 ? (
					<TrendingUpIcon className="h-3.5 w-3.5" />
				) : trend < 0 ? (
					<TrendingDownIcon className="h-3.5 w-3.5" />
				) : (
					<MinusIcon className="h-3.5 w-3.5" />
				)}
				{trend === 0 ? 'Same as yesterday' : `${Math.abs(trend).toFixed(1)}% vs yesterday`}
			</div>
		)}
	</div>
);

/* ── Main analytics content ─────────────────────────────────────────────── */
const AnalyticsContent = () => {
	const trpc = useTRPC();

	const { data: summary } = useSuspenseQuery(trpc.analytics.summary.queryOptions());
	const { data: revenueByDay } = useSuspenseQuery(trpc.analytics.revenueByDay.queryOptions());
	const { data: topProducts } = useSuspenseQuery(trpc.analytics.topProducts.queryOptions());
	const { data: paymentBreakdown } = useSuspenseQuery(
		trpc.analytics.paymentMethodBreakdown.queryOptions()
	);
	const { data: statusBreakdown } = useSuspenseQuery(
		trpc.analytics.orderStatusBreakdown.queryOptions()
	);
	const { data: recentOrders } = useSuspenseQuery(trpc.analytics.recentOrders.queryOptions());

	const revenueTrend = pct(summary.today.revenue, summary.yesterday.revenue);
	const orderTrend = pct(summary.today.orderCount, summary.yesterday.orderCount);

	const chartData = revenueByDay.map((d) => ({
		...d,
		label: format(new Date(d.date), 'dd MMM'),
	}));

	const topProductsData = topProducts.map((p) => ({
		name: p.name.length > 18 ? p.name.slice(0, 16) + '…' : p.name,
		fullName: p.name,
		qty: p.totalQty,
		revenue: Number(p.totalRevenue),
	}));

	const paymentData = paymentBreakdown
		.filter((p) => p.method)
		.map((p) => ({
			name: p.method!.toUpperCase(),
			value: p.count,
			revenue: Number(p.revenue),
			color: PAYMENT_COLORS[p.method!] ?? '#6b7280',
		}));

	const statusData = statusBreakdown.map((s) => ({
		name: s.status,
		value: s.count,
		color: STATUS_COLORS[s.status] ?? '#6b7280',
	}));

	return (
		<div className="flex flex-col gap-6 p-6">
			{/* Header */}
			<div>
				<h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
				<p className="text-sm text-gray-400">Analytics overview · last 30 days</p>
			</div>

			{/* KPI row */}
			<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
				<KpiCard
					title="Today's Revenue"
					value={formatUSD(summary.today.revenue)}
					sub={`${summary.today.orderCount} orders today`}
					icon={TrendingUpIcon}
					iconBg="bg-green-600"
					trend={revenueTrend}
				/>
				<KpiCard
					title="Today's Orders"
					value={String(summary.today.orderCount)}
					sub={`Yesterday: ${summary.yesterday.orderCount}`}
					icon={ShoppingCartIcon}
					iconBg="bg-blue-600"
					trend={orderTrend}
				/>
				<KpiCard
					title="30-Day Revenue"
					value={formatUSD(summary.month.revenue)}
					sub={`${summary.month.orderCount} orders`}
					icon={TrendingUpIcon}
					iconBg="bg-purple-600"
				/>
				<KpiCard
					title="Members"
					value={String(summary.totalCustomers)}
					sub={`${summary.totalProducts} products listed`}
					icon={UsersIcon}
					iconBg="bg-orange-500"
				/>
			</div>

			{/* Charts row 1 */}
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
				{/* Revenue area chart — wide */}
				<div className="col-span-2 rounded-2xl bg-white p-5 shadow-sm">
					<p className="mb-4 text-sm font-semibold text-gray-800">
						Revenue · Last 30 Days
					</p>
					<ResponsiveContainer width="100%" height={220}>
						<AreaChart data={chartData}>
							<defs>
								<linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="#16a34a" stopOpacity={0.2} />
									<stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
								</linearGradient>
							</defs>
							<CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
							<XAxis
								dataKey="label"
								tick={{ fontSize: 10 }}
								tickLine={false}
								axisLine={false}
								interval={4}
							/>
							<YAxis
								tick={{ fontSize: 10 }}
								tickLine={false}
								axisLine={false}
								tickFormatter={(v) => `$${v}`}
							/>
							<Tooltip
								formatter={(v: number) => [formatUSD(v), 'Revenue']}
								contentStyle={{
									borderRadius: 12,
									border: 'none',
									boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
								}}
							/>
							<Area
								type="monotone"
								dataKey="revenue"
								stroke="#16a34a"
								strokeWidth={2}
								fill="url(#revenueGrad)"
								dot={false}
							/>
						</AreaChart>
					</ResponsiveContainer>
				</div>

				{/* Payment breakdown pie */}
				<div className="rounded-2xl bg-white p-5 shadow-sm">
					<p className="mb-4 text-sm font-semibold text-gray-800">Payment Methods</p>
					{paymentData.length === 0 ? (
						<div className="flex h-48 items-center justify-center text-xs text-gray-400">
							No data yet
						</div>
					) : (
						<>
							<ResponsiveContainer width="100%" height={160}>
								<PieChart>
									<Pie
										data={paymentData}
										cx="50%"
										cy="50%"
										innerRadius={45}
										outerRadius={70}
										dataKey="value"
										paddingAngle={3}
									>
										{paymentData.map((entry, i) => (
											<Cell key={i} fill={entry.color} />
										))}
									</Pie>
									<Tooltip
										formatter={(v, _, p) => [v, p.payload.name]}
										contentStyle={{
											borderRadius: 12,
											border: 'none',
											boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
										}}
									/>
								</PieChart>
							</ResponsiveContainer>
							<div className="mt-2 flex flex-col gap-1.5">
								{paymentData.map((p) => {
									const Icon =
										PAYMENT_ICONS[p.name.toLowerCase()] ?? BanknoteIcon;
									return (
										<div
											key={p.name}
											className="flex items-center justify-between text-xs"
										>
											<span className="flex items-center gap-1.5 text-gray-600">
												<span
													className="h-2 w-2 rounded-full"
													style={{ background: p.color }}
												/>
												<Icon className="h-3 w-3" />
												{p.name}
											</span>
											<span className="font-semibold text-gray-800">
												{p.value} orders
											</span>
										</div>
									);
								})}
							</div>
						</>
					)}
				</div>
			</div>

			{/* Charts row 2 */}
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
				{/* Top products bar */}
				<div className="col-span-2 rounded-2xl bg-white p-5 shadow-sm">
					<p className="mb-4 text-sm font-semibold text-gray-800">
						Top Products by Quantity Sold
					</p>
					{topProductsData.length === 0 ? (
						<div className="flex h-48 items-center justify-center text-xs text-gray-400">
							No data yet
						</div>
					) : (
						<ResponsiveContainer width="100%" height={220}>
							<BarChart
								data={topProductsData}
								layout="vertical"
								margin={{ left: 0, right: 16 }}
							>
								<CartesianGrid
									strokeDasharray="3 3"
									stroke="#f0f0f0"
									horizontal={false}
								/>
								<XAxis
									type="number"
									tick={{ fontSize: 10 }}
									tickLine={false}
									axisLine={false}
								/>
								<YAxis
									type="category"
									dataKey="name"
									tick={{ fontSize: 10 }}
									tickLine={false}
									axisLine={false}
									width={110}
								/>
								<Tooltip
									formatter={(v: number, _, p) => [
										v + ' pcs',
										p.payload.fullName,
									]}
									contentStyle={{
										borderRadius: 12,
										border: 'none',
										boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
									}}
								/>
								<Bar dataKey="qty" fill="#16a34a" radius={[0, 6, 6, 0]} />
							</BarChart>
						</ResponsiveContainer>
					)}
				</div>

				{/* Order status + recent orders */}
				<div className="flex flex-col gap-4">
					{/* Status breakdown */}
					<div className="rounded-2xl bg-white p-5 shadow-sm">
						<p className="mb-3 text-sm font-semibold text-gray-800">Order Status</p>
						<div className="flex flex-col gap-2">
							{statusData.map((s) => {
								const total = statusData.reduce((a, b) => a + b.value, 0);
								const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
								return (
									<div key={s.name} className="flex flex-col gap-1">
										<div className="flex items-center justify-between text-xs">
											<span className="flex items-center gap-1.5 text-gray-600 capitalize">
												<span
													className="h-2 w-2 rounded-full"
													style={{ background: s.color }}
												/>
												{s.name}
											</span>
											<span className="font-semibold text-gray-800">
												{s.value} ({pct}%)
											</span>
										</div>
										<div className="h-1.5 w-full rounded-full bg-gray-100">
											<div
												className="h-1.5 rounded-full transition-all"
												style={{ width: `${pct}%`, background: s.color }}
											/>
										</div>
									</div>
								);
							})}
						</div>
					</div>

					{/* Recent orders */}
					<div className="flex-1 rounded-2xl bg-white p-5 shadow-sm">
						<p className="mb-3 text-sm font-semibold text-gray-800">Recent Orders</p>
						<div className="flex flex-col gap-2">
							{recentOrders.map((o) => (
								<div key={o.id} className="flex items-center gap-3">
									<div className="min-w-0 flex-1">
										<p className="font-mono text-xs font-bold text-gray-800">
											#{o.id.slice(0, 8).toUpperCase()}
										</p>
										<p className="text-[10px] text-gray-400">
											{o.customerName ?? 'Walk-in'} ·{' '}
											{format(new Date(o.createdAt), 'HH:mm')}
										</p>
									</div>
									<div className="flex flex-col items-end gap-1">
										<p className="text-xs font-bold text-green-700">
											{formatUSD(Number(o.total))}
										</p>
										<OrderStatusBadge
											status={
												o.status as
													| 'pending'
													| 'processing'
													| 'completed'
													| 'cancelled'
											}
										/>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

/* ── Skeleton ───────────────────────────────────────────────────────────── */
export const AnalyticsViewLoading = () => (
	<div className="flex flex-col gap-6 p-6">
		<div>
			<Skeleton className="h-6 w-32 rounded" />
			<Skeleton className="mt-1 h-4 w-48 rounded" />
		</div>
		<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
			{Array.from({ length: 4 }).map((_, i) => (
				<div key={i} className="space-y-3 rounded-2xl bg-white p-5 shadow-sm">
					<div className="flex justify-between">
						<Skeleton className="h-3 w-24 rounded" />
						<Skeleton className="h-9 w-9 rounded-xl" />
					</div>
					<Skeleton className="h-7 w-28 rounded" />
					<Skeleton className="h-3 w-36 rounded" />
				</div>
			))}
		</div>
		<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
			<div className="col-span-2 rounded-2xl bg-white p-5 shadow-sm">
				<Skeleton className="mb-4 h-4 w-40 rounded" />
				<Skeleton className="h-[220px] w-full rounded-xl" />
			</div>
			<div className="rounded-2xl bg-white p-5 shadow-sm">
				<Skeleton className="mb-4 h-4 w-32 rounded" />
				<Skeleton className="mx-auto h-40 w-40 rounded-full" />
				<div className="mt-4 space-y-2">
					{Array.from({ length: 4 }).map((_, i) => (
						<Skeleton key={i} className="h-3 w-full rounded" />
					))}
				</div>
			</div>
		</div>
	</div>
);

/* ── Root view ──────────────────────────────────────────────────────────── */
const AnalyticsView = () => (
	<div className="flex flex-1 flex-col bg-muted/40">
		<ErrorBoundary
			fallback={
				<ErrorState title="Error loading analytics" description="Please try again later." />
			}
		>
			<Suspense fallback={<AnalyticsViewLoading />}>
				<AnalyticsContent />
			</Suspense>
		</ErrorBoundary>
	</div>
);

export default AnalyticsView;
