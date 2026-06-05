import { format } from 'date-fns';
import { OrderStatusBadge } from '@/modules/orders/ui/components/order-status-badge';

interface RecentOrder {
	id: string;
	createdAt: Date | string;
	customerName?: string | null;
	total: string | number;
	status: string;
}

interface Props {
	orders: RecentOrder[];
	formatCurrency: (v: number) => string;
}

export const AnalyticsRecentOrders = ({ orders, formatCurrency }: Props) => (
	<div className="flex-1 rounded-2xl bg-white p-4 shadow-sm md:p-5">
		<p className="mb-3 text-sm font-semibold text-gray-800">Recent Orders</p>
		<div className="flex flex-col gap-2">
			{orders.map((o) => (
				<div key={o.id} className="flex items-center gap-3">
					<div className="min-w-0 flex-1">
						<p className="font-mono text-xs font-bold text-gray-800">
							#{o.id.slice(0, 8).toUpperCase()}
						</p>
						<p className="text-[10px] text-gray-400">
							{o.customerName ?? 'Walk-in'} · {format(new Date(o.createdAt), 'HH:mm')}
						</p>
					</div>
					<div className="flex flex-col items-end gap-1">
						<p className="text-xs font-bold text-green-700">
							{formatCurrency(Number(o.total))}
						</p>
						<OrderStatusBadge
							status={
								o.status as 'pending' | 'processing' | 'completed' | 'cancelled'
							}
						/>
					</div>
				</div>
			))}
		</div>
	</div>
);
