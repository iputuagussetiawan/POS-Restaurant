'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ProductEntry {
	name: string;
	fullName: string;
	qty: number;
	revenue: number;
}

interface Props {
	data: ProductEntry[];
}

export const AnalyticsTopProductsChart = ({ data }: Props) => (
	<div className="rounded-2xl bg-white p-4 shadow-sm md:p-5 lg:col-span-2">
		<p className="mb-4 text-sm font-semibold text-gray-800">Top Products by Quantity Sold</p>
		{data.length === 0 ? (
			<div className="flex h-48 items-center justify-center text-xs text-gray-400">
				No data yet
			</div>
		) : (
			<ResponsiveContainer width="100%" height={220}>
				<BarChart data={data} layout="vertical" margin={{ left: 0, right: 16 }}>
					<CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
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
						formatter={(v: number, _, p) => [v + ' pcs', p.payload.fullName]}
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
);
