'use client';

import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from 'recharts';

interface Props {
	data: { label: string; revenue: number }[];
	formatCurrency: (v: number) => string;
}

export const AnalyticsRevenueChart = ({ data, formatCurrency }: Props) => (
	<div className="rounded-2xl bg-white p-4 shadow-sm md:p-5 lg:col-span-2">
		<p className="mb-4 text-sm font-semibold text-gray-800">Revenue · Last 30 Days</p>
		<ResponsiveContainer width="100%" height={220}>
			<AreaChart data={data}>
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
					formatter={(v: number) => [formatCurrency(v), 'Revenue']}
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
);
