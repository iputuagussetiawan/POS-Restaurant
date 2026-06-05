'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { BanknoteIcon, CreditCardIcon, QrCodeIcon, ArrowRightLeftIcon } from 'lucide-react';

const PAYMENT_ICONS: Record<string, React.ElementType> = {
	cash: BanknoteIcon,
	card: CreditCardIcon,
	qris: QrCodeIcon,
	transfer: ArrowRightLeftIcon,
};

interface PaymentEntry {
	name: string;
	value: number;
	revenue: number;
	color: string;
}

interface Props {
	data: PaymentEntry[];
}

export const AnalyticsPaymentChart = ({ data }: Props) => (
	<div className="rounded-2xl bg-white p-4 shadow-sm md:p-5">
		<p className="mb-4 text-sm font-semibold text-gray-800">Payment Methods</p>
		{data.length === 0 ? (
			<div className="flex h-48 items-center justify-center text-xs text-gray-400">
				No data yet
			</div>
		) : (
			<>
				<ResponsiveContainer width="100%" height={160}>
					<PieChart>
						<Pie
							data={data}
							cx="50%"
							cy="50%"
							innerRadius={45}
							outerRadius={70}
							dataKey="value"
							paddingAngle={3}
						>
							{data.map((entry, i) => (
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
					{data.map((p) => {
						const Icon = PAYMENT_ICONS[p.name.toLowerCase()] ?? BanknoteIcon;
						return (
							<div key={p.name} className="flex items-center justify-between text-xs">
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
);
