'use client';

import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { TrendingUpIcon, ShoppingCartIcon, UsersIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorState from '@/components/error-state';
import { useCurrency } from '@/modules/company/hooks/use-currency';
import { AnalyticsViewLoading } from './analytics-view-loading';
import { AnalyticsKpiCard } from '../components/analytics-kpi-card';
import { AnalyticsRevenueChart } from '../components/analytics-revenue-chart';
import { AnalyticsPaymentChart } from '../components/analytics-payment-chart';
import { AnalyticsTopProductsChart } from '../components/analytics-top-products-chart';
import { AnalyticsStatusBreakdown } from '../components/analytics-status-breakdown';
import { AnalyticsRecentOrders } from '../components/analytics-recent-orders';

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

const STATUS_COLORS: Record<string, string> = {
	pending: '#f59e0b',
	processing: '#3b82f6',
	completed: '#16a34a',
	cancelled: '#ef4444',
};

const AnalyticsContent = () => {
	const trpc = useTRPC();
	const { format: formatCurrency } = useCurrency();

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
		<div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
			<div>
				<h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
				<p className="text-sm text-gray-400">Analytics overview · last 30 days</p>
			</div>

			<div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
				<AnalyticsKpiCard
					title="Today's Revenue"
					value={formatCurrency(summary.today.revenue)}
					sub={`${summary.today.orderCount} orders today`}
					icon={TrendingUpIcon}
					iconBg="bg-green-600"
					trend={revenueTrend}
				/>
				<AnalyticsKpiCard
					title="Today's Orders"
					value={String(summary.today.orderCount)}
					sub={`Yesterday: ${summary.yesterday.orderCount}`}
					icon={ShoppingCartIcon}
					iconBg="bg-blue-600"
					trend={orderTrend}
				/>
				<AnalyticsKpiCard
					title="30-Day Revenue"
					value={formatCurrency(summary.month.revenue)}
					sub={`${summary.month.orderCount} orders`}
					icon={TrendingUpIcon}
					iconBg="bg-purple-600"
				/>
				<AnalyticsKpiCard
					title="Members"
					value={String(summary.totalCustomers)}
					sub={`${summary.totalProducts} products listed`}
					icon={UsersIcon}
					iconBg="bg-orange-500"
				/>
			</div>

			<div className="grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-3">
				<AnalyticsRevenueChart data={chartData} formatCurrency={formatCurrency} />
				<AnalyticsPaymentChart data={paymentData} />
			</div>

			<div className="grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-3">
				<AnalyticsTopProductsChart data={topProductsData} />
				<div className="flex flex-col gap-3 md:gap-4">
					<AnalyticsStatusBreakdown data={statusData} />
					<AnalyticsRecentOrders orders={recentOrders} formatCurrency={formatCurrency} />
				</div>
			</div>
		</div>
	);
};

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
