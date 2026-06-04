'use client';

import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';
import { useCurrency } from '@/modules/company/hooks/use-currency';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
	AreaChart,
	Area,
	BarChart,
	Bar,
	PieChart,
	Pie,
	Cell,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from 'recharts';
import { TrendingUpIcon, ClockIcon, CreditCardIcon, BarChart2Icon } from 'lucide-react';
import { format } from 'date-fns';

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

const PAYMENT_LABELS: Record<string, string> = {
	cash: 'Cash',
	card: 'Card',
	qris: 'QRIS',
	transfer: 'Transfer',
};

interface Props {
	open: boolean;
	onOpenChange: (v: boolean) => void;
	search?: string;
	dateFrom?: string;
	dateTo?: string;
}

const ChartSection = ({
	title,
	icon: Icon,
	iconBg,
	children,
}: {
	title: string;
	icon: React.ElementType;
	iconBg: string;
	children: React.ReactNode;
}) => (
	<div className="flex flex-col gap-3 rounded-2xl border bg-white p-5 shadow-sm">
		<div className="flex items-center gap-2.5">
			<div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', iconBg)}>
				<Icon className="h-4 w-4 text-white" />
			</div>
			<h3 className="text-sm font-semibold text-gray-800">{title}</h3>
		</div>
		{children}
	</div>
);

const OrderChartDialog = ({ open, onOpenChange, search, dateFrom, dateTo }: Props) => {
	const trpc = useTRPC();
	const { format: formatCurrency } = useCurrency();

	const { data, isLoading } = useQuery({
		...trpc.orders.chartData.queryOptions({ search, dateFrom, dateTo }),
		enabled: open,
	});

	const totalOrders = data?.byStatus.reduce((s, r) => s + r.orderCount, 0) ?? 0;
	const totalRevenue = data?.byDay.reduce((s, r) => s + Number(r.revenue), 0) ?? 0;
	const peakHour = data?.byHour.reduce((best, r) => (r.orderCount > best.orderCount ? r : best), {
		hour: 0,
		label: '—',
		orderCount: 0,
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[92vh] w-[80vw] max-w-[80vw] overflow-y-auto p-0">
				<DialogHeader className="sticky top-0 z-10 border-b bg-white px-6 py-4">
					<div className="flex items-center gap-3">
						<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-700">
							<BarChart2Icon className="h-5 w-5 text-white" />
						</div>
						<div>
							<DialogTitle className="text-base font-semibold text-gray-900">
								Order Analytics
							</DialogTitle>
							<p className="text-xs text-gray-400">
								{dateFrom && dateTo
									? `${format(new Date(dateFrom), 'dd MMM')} – ${format(new Date(dateTo), 'dd MMM yyyy')}`
									: dateFrom
										? `From ${format(new Date(dateFrom), 'dd MMM yyyy')}`
										: 'All time'}
							</p>
						</div>
					</div>
				</DialogHeader>

				<div className="flex flex-col gap-5 bg-gray-50 p-6">
					{/* KPI strip */}
					{isLoading ? (
						<div className="grid grid-cols-3 gap-3">
							{[1, 2, 3].map((i) => (
								<Skeleton key={i} className="h-20 rounded-2xl" />
							))}
						</div>
					) : (
						<div className="grid grid-cols-3 gap-3">
							{[
								{
									label: 'Total Orders',
									value: String(totalOrders),
									sub: 'in selected range',
									bg: 'bg-blue-600',
									icon: BarChart2Icon,
								},
								{
									label: 'Total Revenue',
									value: formatCurrency(totalRevenue),
									sub: 'all payment methods',
									bg: 'bg-green-600',
									icon: TrendingUpIcon,
								},
								{
									label: 'Peak Hour',
									value: peakHour?.label ?? '—',
									sub: peakHour ? `${peakHour.orderCount} orders` : 'no data',
									bg: 'bg-purple-600',
									icon: ClockIcon,
								},
							].map(({ label, value, sub, bg, icon: Icon }) => (
								<div
									key={label}
									className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm"
								>
									<div
										className={cn(
											'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
											bg
										)}
									>
										<Icon className="h-5 w-5 text-white" />
									</div>
									<div>
										<p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
											{label}
										</p>
										<p className="text-lg font-bold text-gray-900">{value}</p>
										<p className="text-[10px] text-gray-400">{sub}</p>
									</div>
								</div>
							))}
						</div>
					)}

					{/* Revenue by day */}
					<ChartSection
						title="Revenue by Day"
						icon={TrendingUpIcon}
						iconBg="bg-green-600"
					>
						{isLoading ? (
							<Skeleton className="h-48 w-full rounded-xl" />
						) : !data?.byDay.length ? (
							<p className="py-10 text-center text-xs text-gray-400">No data</p>
						) : (
							<ResponsiveContainer width="100%" height={200}>
								<AreaChart data={data.byDay}>
									<defs>
										<linearGradient
											id="revenueGrad"
											x1="0"
											y1="0"
											x2="0"
											y2="1"
										>
											<stop
												offset="5%"
												stopColor="#16a34a"
												stopOpacity={0.2}
											/>
											<stop
												offset="95%"
												stopColor="#16a34a"
												stopOpacity={0}
											/>
										</linearGradient>
									</defs>
									<CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
									<XAxis
										dataKey="date"
										tick={{ fontSize: 10 }}
										tickLine={false}
										axisLine={false}
										tickFormatter={(v) => format(new Date(v), 'dd MMM')}
										interval="preserveStartEnd"
									/>
									<YAxis
										tick={{ fontSize: 10 }}
										tickLine={false}
										axisLine={false}
										tickFormatter={(v) => formatCurrency(v)}
										width={70}
									/>
									<Tooltip
										formatter={(v: number) => [formatCurrency(v), 'Revenue']}
										contentStyle={{
											borderRadius: 10,
											border: 'none',
											boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
											fontSize: 12,
										}}
										labelFormatter={(l) => format(new Date(l), 'dd MMM yyyy')}
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
						)}
					</ChartSection>

					{/* Orders by hour */}
					<ChartSection
						title="Orders by Hour of Day"
						icon={ClockIcon}
						iconBg="bg-purple-600"
					>
						{isLoading ? (
							<Skeleton className="h-48 w-full rounded-xl" />
						) : (
							<ResponsiveContainer width="100%" height={200}>
								<BarChart data={data?.byHour ?? []}>
									<CartesianGrid
										strokeDasharray="3 3"
										stroke="#f0f0f0"
										vertical={false}
									/>
									<XAxis
										dataKey="label"
										tick={{ fontSize: 9 }}
										tickLine={false}
										axisLine={false}
										interval={1}
									/>
									<YAxis
										tick={{ fontSize: 10 }}
										tickLine={false}
										axisLine={false}
										allowDecimals={false}
										width={28}
									/>
									<Tooltip
										formatter={(v: number) => [v, 'Orders']}
										contentStyle={{
											borderRadius: 10,
											border: 'none',
											boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
											fontSize: 12,
										}}
									/>
									<Bar
										dataKey="orderCount"
										fill="#9333ea"
										radius={[4, 4, 0, 0]}
									/>
								</BarChart>
							</ResponsiveContainer>
						)}
					</ChartSection>

					{/* Payment method + Status breakdown side by side */}
					<div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
						{/* Payment method */}
						<ChartSection
							title="Payment Methods"
							icon={CreditCardIcon}
							iconBg="bg-blue-600"
						>
							{isLoading ? (
								<Skeleton className="h-48 w-full rounded-xl" />
							) : !data?.byPayment.filter((p) => p.method).length ? (
								<p className="py-10 text-center text-xs text-gray-400">No data</p>
							) : (
								<>
									<ResponsiveContainer width="100%" height={160}>
										<PieChart>
											<Pie
												data={data?.byPayment.filter((p) => p.method)}
												cx="50%"
												cy="50%"
												innerRadius={45}
												outerRadius={70}
												dataKey="orderCount"
												paddingAngle={3}
											>
												{data?.byPayment
													.filter((p) => p.method)
													.map((entry, i) => (
														<Cell
															key={i}
															fill={
																PAYMENT_COLORS[entry.method!] ??
																'#6b7280'
															}
														/>
													))}
											</Pie>
											<Tooltip
												formatter={(v: number, _, p) => [
													v,
													PAYMENT_LABELS[p.payload.method] ??
														p.payload.method,
												]}
												contentStyle={{
													borderRadius: 10,
													border: 'none',
													boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
													fontSize: 12,
												}}
											/>
										</PieChart>
									</ResponsiveContainer>
									<div className="flex flex-col gap-1.5">
										{data?.byPayment
											.filter((p) => p.method)
											.map((p) => (
												<div
													key={p.method}
													className="flex items-center justify-between text-xs"
												>
													<span className="flex items-center gap-2 text-gray-600">
														<span
															className="h-2.5 w-2.5 rounded-full"
															style={{
																background:
																	PAYMENT_COLORS[p.method!] ??
																	'#6b7280',
															}}
														/>
														{PAYMENT_LABELS[p.method!] ?? p.method}
													</span>
													<span className="font-semibold text-gray-800">
														{p.orderCount} orders ·{' '}
														{formatCurrency(p.revenue)}
													</span>
												</div>
											))}
									</div>
								</>
							)}
						</ChartSection>

						{/* Status breakdown */}
						<ChartSection
							title="Order Status"
							icon={BarChart2Icon}
							iconBg="bg-amber-500"
						>
							{isLoading ? (
								<Skeleton className="h-48 w-full rounded-xl" />
							) : !data?.byStatus.length ? (
								<p className="py-10 text-center text-xs text-gray-400">No data</p>
							) : (
								<>
									<ResponsiveContainer width="100%" height={160}>
										<PieChart>
											<Pie
												data={data?.byStatus}
												cx="50%"
												cy="50%"
												innerRadius={45}
												outerRadius={70}
												dataKey="orderCount"
												paddingAngle={3}
											>
												{data?.byStatus.map((entry, i) => (
													<Cell
														key={i}
														fill={
															STATUS_COLORS[entry.status] ?? '#6b7280'
														}
													/>
												))}
											</Pie>
											<Tooltip
												formatter={(v: number, _, p) => [
													v,
													p.payload.status,
												]}
												contentStyle={{
													borderRadius: 10,
													border: 'none',
													boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
													fontSize: 12,
												}}
											/>
										</PieChart>
									</ResponsiveContainer>
									<div className="flex flex-col gap-1.5">
										{data?.byStatus.map((s) => {
											const pct =
												totalOrders > 0
													? Math.round((s.orderCount / totalOrders) * 100)
													: 0;
											return (
												<div key={s.status} className="flex flex-col gap-1">
													<div className="flex items-center justify-between text-xs">
														<span className="flex items-center gap-2 text-gray-600 capitalize">
															<span
																className="h-2.5 w-2.5 rounded-full"
																style={{
																	background:
																		STATUS_COLORS[s.status] ??
																		'#6b7280',
																}}
															/>
															{s.status}
														</span>
														<span className="font-semibold text-gray-800">
															{s.orderCount} ({pct}%)
														</span>
													</div>
													<div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
														<div
															className="h-full rounded-full transition-all duration-500"
															style={{
																width: `${pct}%`,
																background:
																	STATUS_COLORS[s.status] ??
																	'#6b7280',
															}}
														/>
													</div>
												</div>
											);
										})}
									</div>
								</>
							)}
						</ChartSection>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default OrderChartDialog;
