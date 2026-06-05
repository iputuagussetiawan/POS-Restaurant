'use client';

import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { TableCell, TableRow } from '@/components/ui/table';
import { OrderStatusBadge } from './order-status-badge';
import { OrderActionMenu } from './order-action-menu';
import { STATUS_ICON, PAYMENT_ICON, PAYMENT_LABEL, type Order } from './order-constants';
import { useCurrency } from '@/modules/company/hooks/use-currency';
import { UserIcon, BadgeCheckIcon, PackageIcon, ShieldCheckIcon } from 'lucide-react';

interface Props {
	order: Order;
	onUpdate: (id: string, status: string) => void;
	isPending?: boolean;
}

export const OrderRow = ({ order, onUpdate, isPending }: Props) => {
	const { format: formatCurrency } = useCurrency();
	const cfg = STATUS_ICON[order.status] ?? STATUS_ICON.pending;
	const Icon = cfg.icon;
	const PayIcon = order.paymentMethod ? PAYMENT_ICON[order.paymentMethod] : null;
	const displayCustomer = order.customerName2 ?? order.customerName ?? 'Walk-in';
	const isMember = !!order.customerId && !!order.customerName2;

	return (
		<TableRow className="hover:bg-gray-50/60">
			<TableCell className="px-4 py-3">
				<div className="flex items-center gap-2.5">
					<div
						className={cn(
							'flex h-8 w-8 items-center justify-center rounded-lg',
							cfg.bg
						)}
					>
						<Icon className={cn('h-4 w-4', cfg.color)} />
					</div>
					<div>
						<p className="font-mono text-xs font-semibold text-gray-800">
							#{order.id.slice(0, 8).toUpperCase()}
						</p>
						<p className="text-[10px] text-gray-400">
							{format(new Date(order.createdAt), 'dd MMM, HH:mm')}
						</p>
					</div>
				</div>
			</TableCell>
			<TableCell className="px-4 py-3">
				<div className="flex items-center gap-1.5">
					{isMember ? (
						<BadgeCheckIcon className="h-3.5 w-3.5 shrink-0 text-green-600" />
					) : (
						<UserIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
					)}
					<div>
						<p
							className={cn(
								'text-xs font-medium',
								isMember ? 'text-green-700' : 'text-gray-600'
							)}
						>
							{displayCustomer}
						</p>
						{order.customerPhone && (
							<p className="text-[10px] text-gray-400">{order.customerPhone}</p>
						)}
					</div>
				</div>
			</TableCell>
			<TableCell className="px-4 py-3">
				{PayIcon && (
					<span className="flex items-center gap-1 text-xs text-gray-600">
						<PayIcon className="h-3.5 w-3.5" />
						{PAYMENT_LABEL[order.paymentMethod!]}
					</span>
				)}
			</TableCell>
			<TableCell className="px-4 py-3 text-xs text-gray-500">
				{order.cashierName ?? '—'}
			</TableCell>
			<TableCell className="px-4 py-3">
				<span className="flex items-center gap-1 text-xs text-gray-500">
					<PackageIcon className="h-3.5 w-3.5" />
					{order.itemCount ?? 0} item{(order.itemCount ?? 0) !== 1 ? 's' : ''}
				</span>
			</TableCell>
			<TableCell className="px-4 py-3">
				<p className="text-sm font-bold text-green-700">{formatCurrency(order.total)}</p>
				{Number(order.serviceCharge) > 0 && (
					<p className="text-[10px] text-gray-400">
						Svc {formatCurrency(order.serviceCharge)}
					</p>
				)}
			</TableCell>
			<TableCell className="px-4 py-3">
				<OrderStatusBadge
					status={order.status as 'pending' | 'processing' | 'completed' | 'cancelled'}
				/>
			</TableCell>
			<TableCell className="px-4 py-3 text-right">
				<OrderActionMenu order={order} onUpdate={onUpdate} isPending={isPending} />
			</TableCell>
		</TableRow>
	);
};
