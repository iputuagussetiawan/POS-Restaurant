'use client';

import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useCurrency } from '@/modules/company/hooks/use-currency';
import {
	PackageIcon,
	UserIcon,
	BadgeCheckIcon,
	Loader2Icon,
	RefreshCwIcon,
	CheckIcon,
	ClockIcon,
	AlertTriangleIcon,
	EyeIcon,
} from 'lucide-react';
import { KitchenOrderTimer } from './kitchen-order-timer';
import { PAYMENT_ICON, PAYMENT_LABEL, type KitchenTab } from './kitchen-constants';

export type KitchenOrderItem = {
	id: string;
	createdAt: string;
	total: string;
	subtotal: string;
	itemCount?: number | null;
	note?: string | null;
	paymentMethod?: string | null;
	customerName?: string | null;
	customerName2?: string | null;
	customerId?: string | null;
	cashierName?: string | null;
};

interface Props {
	order: KitchenOrderItem;
	tab: KitchenTab;
	onAction: (id: string, next: 'processing' | 'completed') => void;
	isActing: boolean;
	onView: () => void;
}

export const KitchenOrderCard = ({ order, tab, onAction, isActing, onView }: Props) => {
	const { format: formatCurrency } = useCurrency();
	const isMember = !!order.customerId && !!order.customerName2;
	const displayCustomer = order.customerName2 ?? order.customerName ?? 'Walk-in';
	const PayIcon = order.paymentMethod ? PAYMENT_ICON[order.paymentMethod] : null;
	const mins = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60_000);
	const urgent = mins >= 15;

	return (
		<div
			className={cn(
				'group flex flex-col overflow-hidden rounded-2xl border transition-all duration-300',
				urgent
					? 'border-red-500/50 bg-gray-900 shadow-[0_0_30px_rgba(239,68,68,0.15)] ring-1 ring-red-500/20'
					: tab === 'pending'
						? 'border-amber-500/30 bg-gray-900 shadow-[0_0_20px_rgba(251,191,36,0.06)]'
						: 'border-blue-500/30 bg-gray-900 shadow-[0_0_20px_rgba(59,130,246,0.06)]'
			)}
		>
			<div
				className={cn(
					'h-1.5 w-full',
					urgent
						? 'bg-gradient-to-r from-red-500 to-rose-400'
						: tab === 'pending'
							? 'bg-gradient-to-r from-amber-400 to-orange-400'
							: 'bg-gradient-to-r from-blue-500 to-cyan-400'
				)}
			/>

			<div className="flex flex-1 flex-col gap-3 p-4">
				{/* ID + timer */}
				<div className="flex items-center justify-between">
					<div>
						<span className="font-mono text-base font-extrabold tracking-wide text-white">
							#{order.id.slice(0, 8).toUpperCase()}
						</span>
						<p className="text-[10px] text-gray-600">
							{format(new Date(order.createdAt), 'HH:mm:ss')}
						</p>
					</div>
					<KitchenOrderTimer createdAt={order.createdAt} />
				</div>

				{/* Item count + total */}
				<div
					className={cn(
						'rounded-xl px-3 py-2.5',
						urgent ? 'bg-red-500/10' : 'bg-white/5'
					)}
				>
					<div className="flex items-center justify-between">
						<span className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
							<PackageIcon className="h-3 w-3" />
							{order.itemCount ?? 0} item{(order.itemCount ?? 0) !== 1 ? 's' : ''}
						</span>
						<span className="text-sm font-bold text-white">
							{formatCurrency(order.total)}
						</span>
					</div>
				</div>

				{/* Note */}
				{order.note && (
					<div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2">
						<AlertTriangleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
						<p className="text-[11px] leading-snug text-amber-300 italic">
							{order.note}
						</p>
					</div>
				)}

				{/* Pills */}
				<div className="flex flex-wrap items-center gap-1.5">
					<span
						className={cn(
							'flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold',
							urgent
								? 'bg-red-500/20 text-red-400'
								: tab === 'pending'
									? 'bg-amber-500/20 text-amber-300'
									: 'bg-blue-500/20 text-blue-300'
						)}
					>
						{urgent ? (
							<AlertTriangleIcon className="h-2.5 w-2.5" />
						) : tab === 'pending' ? (
							<ClockIcon className="h-2.5 w-2.5" />
						) : (
							<RefreshCwIcon className="h-2.5 w-2.5" />
						)}
						{urgent ? 'URGENT' : tab === 'pending' ? 'New' : 'In Progress'}
					</span>
					{PayIcon && order.paymentMethod && (
						<span className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-gray-300">
							<PayIcon className="h-2.5 w-2.5" />
							{PAYMENT_LABEL[order.paymentMethod] ?? order.paymentMethod}
						</span>
					)}
				</div>

				{/* Customer */}
				<div className="flex items-center gap-1.5 border-t border-white/5 pt-2 text-xs text-gray-500">
					{isMember ? (
						<BadgeCheckIcon className="h-3.5 w-3.5 shrink-0 text-green-500" />
					) : (
						<UserIcon className="h-3.5 w-3.5 shrink-0" />
					)}
					<span className={cn('truncate', isMember && 'text-green-400')}>
						{displayCustomer}
					</span>
					{order.cashierName && (
						<span className="ml-auto shrink-0 text-[10px] text-gray-700">
							{order.cashierName}
						</span>
					)}
				</div>

				{/* Actions */}
				<div className="flex gap-2 pt-1">
					<button
						onClick={onView}
						className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 py-2 text-xs font-medium text-gray-400 transition-colors hover:border-white/20 hover:bg-white/5 hover:text-white"
					>
						<EyeIcon className="h-3.5 w-3.5" />
						Details
					</button>
					{tab === 'pending' ? (
						<Button
							onClick={() => onAction(order.id, 'processing')}
							disabled={isActing}
							size="sm"
							className="flex-1 bg-amber-500 text-xs font-bold text-white hover:bg-amber-400 disabled:opacity-60"
						>
							{isActing ? (
								<Loader2Icon className="h-3.5 w-3.5 animate-spin" />
							) : (
								<>
									<RefreshCwIcon className="mr-1.5 h-3.5 w-3.5" />
									Accept
								</>
							)}
						</Button>
					) : (
						<Button
							onClick={() => onAction(order.id, 'completed')}
							disabled={isActing}
							size="sm"
							className="flex-1 bg-green-600 text-xs font-bold text-white hover:bg-green-500 disabled:opacity-60"
						>
							{isActing ? (
								<Loader2Icon className="h-3.5 w-3.5 animate-spin" />
							) : (
								<>
									<CheckIcon className="mr-1.5 h-3.5 w-3.5" />
									Done
								</>
							)}
						</Button>
					)}
				</div>
			</div>
		</div>
	);
};
