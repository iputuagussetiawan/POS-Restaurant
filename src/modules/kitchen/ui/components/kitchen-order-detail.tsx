'use client';

import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';
import { useCurrency } from '@/modules/company/hooks/use-currency';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import {
	PackageIcon,
	UserIcon,
	BadgeCheckIcon,
	Loader2Icon,
	RefreshCwIcon,
	CheckCircleIcon,
	UtensilsCrossedIcon,
	AlertTriangleIcon,
} from 'lucide-react';
import { KitchenOrderTimer } from './kitchen-order-timer';
import { type KitchenTab } from './kitchen-constants';

interface Props {
	orderId: string;
	open: boolean;
	onOpenChange: (v: boolean) => void;
	onAction: (id: string, next: 'processing' | 'completed') => void;
	tab: KitchenTab;
	isActing: boolean;
}

export const KitchenOrderDetail = ({
	orderId,
	open,
	onOpenChange,
	onAction,
	tab,
	isActing,
}: Props) => {
	const trpc = useTRPC();
	const { format: formatCurrency } = useCurrency();

	const { data: order, isLoading } = useQuery({
		...trpc.orders.getOne.queryOptions({ id: orderId }),
		enabled: open && !!orderId,
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] w-[95vw] max-w-xl overflow-hidden border-white/10 bg-gray-950 p-0 text-white">
				<DialogHeader className="border-b border-white/10 px-5 py-4">
					<div className="flex items-center justify-between pr-6">
						<div className="flex items-center gap-3">
							<div
								className={cn(
									'flex h-10 w-10 items-center justify-center rounded-xl',
									tab === 'pending' ? 'bg-amber-500' : 'bg-blue-600'
								)}
							>
								<PackageIcon className="h-5 w-5 text-white" />
							</div>
							<div>
								<DialogTitle className="font-mono text-base font-bold text-white">
									#{orderId.slice(0, 8).toUpperCase()}
								</DialogTitle>
								{order && (
									<p className="text-[10px] text-gray-400">
										{format(
											new Date(order.createdAt),
											'EEEE, dd MMM · HH:mm:ss'
										)}
									</p>
								)}
							</div>
						</div>
						{order && <KitchenOrderTimer createdAt={order.createdAt} />}
					</div>
				</DialogHeader>

				<div className="flex max-h-[calc(90vh-130px)] flex-col gap-0 overflow-y-auto">
					{isLoading ? (
						<div className="flex flex-col gap-3 p-5">
							{Array.from({ length: 3 }).map((_, i) => (
								<Skeleton key={i} className="h-20 rounded-xl bg-white/5" />
							))}
						</div>
					) : !order ? (
						<p className="py-12 text-center text-sm text-gray-500">Order not found</p>
					) : (
						<>
							{order.note && (
								<div className="border-b border-amber-500/20 bg-amber-500/10 px-5 py-3">
									<div className="flex items-start gap-2">
										<AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
										<div>
											<p className="text-[10px] font-bold tracking-wider text-amber-400 uppercase">
												Special Instructions
											</p>
											<p className="mt-0.5 text-sm text-amber-200 italic">
												&ldquo;{order.note}&rdquo;
											</p>
										</div>
									</div>
								</div>
							)}

							<div className="flex flex-col gap-1 p-5">
								<p className="mb-2 text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
									{order.items.length} item{order.items.length !== 1 ? 's' : ''}{' '}
									to prepare
								</p>
								{order.items.map((item, idx) => (
									<div
										key={item.id}
										className="flex gap-3 overflow-hidden rounded-xl bg-white/5 p-3"
									>
										<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-sm font-bold text-gray-400">
											{idx + 1}
										</div>
										{item.productImageUrl ? (
											<div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
												<Image
													src={item.productImageUrl}
													alt={item.name}
													fill
													sizes="56px"
													className="object-cover"
												/>
											</div>
										) : (
											<div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-white/10">
												<UtensilsCrossedIcon className="h-6 w-6 text-gray-600" />
											</div>
										)}
										<div className="min-w-0 flex-1">
											<p className="truncate text-sm font-semibold text-white">
												{item.name}
											</p>
											<p className="text-xs text-gray-400">
												{formatCurrency(item.price)} × {item.quantity}
											</p>
										</div>
										<div className="flex shrink-0 flex-col items-end gap-1">
											<span className="rounded-full bg-white/15 px-2.5 py-0.5 text-sm font-bold text-white">
												×{item.quantity}
											</span>
											<span className="text-xs font-semibold text-green-400">
												{formatCurrency(item.subtotal)}
											</span>
										</div>
									</div>
								))}
							</div>

							<div className="border-t border-white/10 bg-black/30 px-5 py-4">
								<div className="mb-3 flex items-center justify-between text-xs text-gray-400">
									<span className="flex items-center gap-1.5">
										{order.customerId && order.customerName2 ? (
											<BadgeCheckIcon className="h-3.5 w-3.5 text-green-500" />
										) : (
											<UserIcon className="h-3.5 w-3.5" />
										)}
										<span
											className={cn(
												order.customerId &&
													order.customerName2 &&
													'text-green-400'
											)}
										>
											{order.customerName2 ?? order.customerName ?? 'Walk-in'}
										</span>
									</span>
									{order.cashierName && (
										<span className="text-gray-600">
											Cashier: {order.cashierName}
										</span>
									)}
								</div>
								<div className="mb-4 flex items-baseline justify-between">
									<span className="text-sm text-gray-400">Order total</span>
									<span className="text-xl font-bold text-green-400">
										{formatCurrency(order.total)}
									</span>
								</div>
								{tab === 'pending' ? (
									<Button
										onClick={() => {
											onAction(orderId, 'processing');
											onOpenChange(false);
										}}
										disabled={isActing}
										className="w-full bg-amber-500 py-6 text-base font-bold text-white hover:bg-amber-400"
									>
										{isActing ? (
											<Loader2Icon className="h-5 w-5 animate-spin" />
										) : (
											<>
												<RefreshCwIcon className="mr-2 h-5 w-5" />
												Accept & Start Preparing
											</>
										)}
									</Button>
								) : (
									<Button
										onClick={() => {
											onAction(orderId, 'completed');
											onOpenChange(false);
										}}
										disabled={isActing}
										className="w-full bg-green-600 py-6 text-base font-bold text-white hover:bg-green-500"
									>
										{isActing ? (
											<Loader2Icon className="h-5 w-5 animate-spin" />
										) : (
											<>
												<CheckCircleIcon className="mr-2 h-5 w-5" />
												Mark as Completed
											</>
										)}
									</Button>
								)}
							</div>
						</>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
};
