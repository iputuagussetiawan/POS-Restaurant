'use client';

import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { OrderStatusBadge } from './order-status-badge';
import { OrderActionMenu } from './order-action-menu';
import { STATUS_ICON, PAYMENT_ICON, PAYMENT_LABEL, GRADIENT, type Order } from './order-constants';
import { useCurrency } from '@/modules/company/hooks/use-currency';
import { PackageIcon, UserIcon, BadgeCheckIcon, ShieldCheckIcon, BanknoteIcon } from 'lucide-react';

interface Props {
	order: Order;
	onUpdate: (id: string, status: string) => void;
	isPending?: boolean;
}

export const OrderCard = ({ order, onUpdate, isPending }: Props) => {
	const { format: formatCurrency } = useCurrency();
	const cfg = STATUS_ICON[order.status] ?? STATUS_ICON.pending;
	const Icon = cfg.icon;
	const gradient = GRADIENT[order.status] ?? GRADIENT.pending;
	const PayIcon = order.paymentMethod ? PAYMENT_ICON[order.paymentMethod] : BanknoteIcon;
	const displayCustomer = order.customerName2 ?? order.customerName ?? null;
	const isMember = !!order.customerId && !!order.customerName2;

	return (
		<div className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.07)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
			<div className={cn('h-1.5 w-full bg-gradient-to-r', gradient)} />
			<div className="flex flex-col gap-3 p-4">
				<div className="flex items-start justify-between">
					<div className="flex items-center gap-2.5">
						<div
							className={cn(
								'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
								cfg.bg
							)}
						>
							<Icon className={cn('h-4.5 w-4.5', cfg.color)} />
						</div>
						<div>
							<p className="font-mono text-sm font-bold tracking-wide text-gray-800">
								#{order.id.slice(0, 8).toUpperCase()}
							</p>
							<p className="text-[11px] text-gray-400">
								{format(new Date(order.createdAt), 'dd MMM yyyy · HH:mm')}
							</p>
						</div>
					</div>
					<OrderActionMenu order={order} onUpdate={onUpdate} isPending={isPending} />
				</div>

				<div className="rounded-xl bg-gray-50 px-4 py-3">
					<p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
						Total
					</p>
					<p className="mt-0.5 text-2xl font-bold text-gray-900">
						{formatCurrency(order.total)}
					</p>
					<div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
						<span>Sub {formatCurrency(order.subtotal)}</span>
						<span className="h-1 w-1 rounded-full bg-gray-300" />
						<span>Tax {formatCurrency(order.tax)}</span>
						{Number(order.serviceCharge) > 0 && (
							<>
								<span className="h-1 w-1 rounded-full bg-gray-300" />
								<span>Svc {formatCurrency(order.serviceCharge)}</span>
							</>
						)}
					</div>
				</div>

				<div className="flex flex-wrap gap-1.5">
					<span className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600">
						<PackageIcon className="h-3 w-3" />
						{order.itemCount ?? 0} item{(order.itemCount ?? 0) !== 1 ? 's' : ''}
					</span>
					{order.paymentMethod && (
						<span className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700">
							<PayIcon className="h-3 w-3" />
							{PAYMENT_LABEL[order.paymentMethod] ?? order.paymentMethod}
						</span>
					)}
					<OrderStatusBadge
						status={
							order.status as 'pending' | 'processing' | 'completed' | 'cancelled'
						}
					/>
				</div>

				<div className="space-y-1.5 border-t border-gray-100 pt-3">
					<div className="flex items-center gap-2">
						{isMember ? (
							<BadgeCheckIcon className="h-3.5 w-3.5 shrink-0 text-green-600" />
						) : (
							<UserIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
						)}
						<div className="min-w-0">
							<span
								className={cn(
									'truncate text-xs font-medium',
									isMember ? 'text-green-700' : 'text-gray-600'
								)}
							>
								{displayCustomer ?? 'Walk-in customer'}
							</span>
							{order.customerPhone && (
								<span className="ml-1.5 text-[10px] text-gray-400">
									{order.customerPhone}
								</span>
							)}
						</div>
						{isMember && (
							<span className="ml-auto shrink-0 rounded-full bg-green-100 px-1.5 py-0.5 text-[9px] font-semibold text-green-700">
								MEMBER
							</span>
						)}
					</div>
					<div className="flex items-center gap-2">
						<ShieldCheckIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
						<span className="text-xs text-gray-500">{order.cashierName ?? '—'}</span>
						<span className="ml-auto text-[10px] text-gray-400">cashier</span>
					</div>
					{order.note && (
						<p className="truncate text-[11px] text-gray-400 italic" title={order.note}>
							&quot;{order.note}&quot;
						</p>
					)}
				</div>
			</div>
		</div>
	);
};
