'use client';

import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ReceiptIcon } from 'lucide-react';
import { OrderStatusBadge } from '@/modules/orders/ui/components/order-status-badge';
import { useCurrency } from '@/modules/company/hooks/use-currency';

type RecentOrder = {
	id: string;
	createdAt: Date | string;
	total: string | number;
	status: string;
};

interface Props {
	orders?: RecentOrder[];
	selectedId: string;
	onSelect: (id: string) => void;
}

export const BillRecentOrders = ({ orders, selectedId, onSelect }: Props) => {
	const { format: formatCurrency } = useCurrency();

	return (
		<div className="w-72 shrink-0">
			<p className="mb-3 text-xs font-semibold tracking-wider text-gray-400 uppercase">
				Recent Orders
			</p>
			<div className="flex flex-col gap-2">
				{!orders &&
					Array.from({ length: 6 }).map((_, i) => (
						<div key={i} className="h-16 animate-pulse rounded-xl bg-white/60" />
					))}
				{orders?.map((o) => {
					const isSelected = selectedId === o.id;
					return (
						<button
							key={o.id}
							onClick={() => onSelect(o.id)}
							className={cn(
								'flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all duration-150',
								isSelected
									? 'border-green-600 bg-green-700 shadow-md'
									: 'border-gray-100 bg-white hover:border-green-300 hover:bg-green-50 hover:shadow-sm'
							)}
						>
							<div
								className={cn(
									'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors',
									isSelected ? 'bg-white/20' : 'bg-gray-100'
								)}
							>
								<ReceiptIcon
									className={cn(
										'h-4 w-4',
										isSelected ? 'text-white' : 'text-gray-500'
									)}
								/>
							</div>
							<div className="min-w-0 flex-1">
								<p
									className={cn(
										'font-mono text-xs font-bold',
										isSelected ? 'text-white' : 'text-gray-800'
									)}
								>
									#{o.id.slice(0, 8).toUpperCase()}
								</p>
								<p
									className={cn(
										'text-[10px]',
										isSelected ? 'text-green-200' : 'text-gray-400'
									)}
								>
									{format(new Date(o.createdAt), 'dd MMM, HH:mm')} ·{' '}
									{formatCurrency(o.total)}
								</p>
							</div>
							<OrderStatusBadge
								status={
									o.status as 'pending' | 'processing' | 'completed' | 'cancelled'
								}
							/>
						</button>
					);
				})}
			</div>
		</div>
	);
};
