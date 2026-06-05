'use client';

import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { OrderStatusBadge } from '@/modules/orders/ui/components/order-status-badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	HistoryIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	BanknoteIcon,
	CreditCardIcon,
	QrCodeIcon,
	ArrowRightLeftIcon,
	UserIcon,
	BadgeCheckIcon,
	ShieldCheckIcon,
	PackageIcon,
} from 'lucide-react';

const PAYMENT_ICON: Record<string, React.ElementType> = {
	cash: BanknoteIcon,
	card: CreditCardIcon,
	qris: QrCodeIcon,
	transfer: ArrowRightLeftIcon,
};

interface HistoryItem {
	id: string;
	createdAt: Date | string;
	customerName?: string | null;
	customerName2?: string | null;
	customerId?: string | null;
	customerPhone?: string | null;
	cashierName?: string | null;
	paymentMethod?: string | null;
	itemCount?: number | null;
	subtotal: string | number;
	tax: string | number;
	serviceCharge?: string | number | null;
	total: string | number;
	status: string;
}

interface Props {
	items: HistoryItem[];
	total: number;
	totalPages: number;
	page: number;
	showServiceCol: boolean;
	formatCurrency: (v: string | number) => string;
	onPageChange: (p: number) => void;
}

export const HistoryTable = ({
	items,
	total,
	totalPages,
	page,
	showServiceCol,
	formatCurrency,
	onPageChange,
}: Props) => (
	<div className="overflow-x-auto rounded-2xl border bg-white">
		<Table>
			<TableHeader>
				<TableRow className="bg-gray-50/60 hover:bg-gray-50/60">
					<TableHead className="px-4 py-3 text-xs">Order</TableHead>
					<TableHead className="px-4 py-3 text-xs">Date</TableHead>
					<TableHead className="px-4 py-3 text-xs">Customer</TableHead>
					<TableHead className="px-4 py-3 text-xs">Cashier</TableHead>
					<TableHead className="px-4 py-3 text-xs">Payment</TableHead>
					<TableHead className="px-4 py-3 text-xs">Items</TableHead>
					<TableHead className="px-4 py-3 text-xs">Subtotal</TableHead>
					<TableHead className="px-4 py-3 text-xs">Tax</TableHead>
					{showServiceCol && <TableHead className="px-4 py-3 text-xs">Service</TableHead>}
					<TableHead className="px-4 py-3 text-xs font-semibold text-green-700">
						Total
					</TableHead>
					<TableHead className="px-4 py-3 text-xs">Status</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{items.length === 0 ? (
					<TableRow>
						<TableCell colSpan={showServiceCol ? 11 : 10} className="py-16 text-center">
							<div className="flex flex-col items-center gap-3">
								<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">
									<HistoryIcon className="h-6 w-6 text-gray-400" />
								</div>
								<p className="text-sm font-medium text-gray-500">
									No orders match your filters
								</p>
							</div>
						</TableCell>
					</TableRow>
				) : (
					items.map((order) => {
						const PayIcon = order.paymentMethod
							? PAYMENT_ICON[order.paymentMethod]
							: null;
						const isMember = !!order.customerId && !!order.customerName2;
						const displayCustomer =
							order.customerName2 ?? order.customerName ?? 'Walk-in';

						return (
							<TableRow key={order.id} className="hover:bg-green-50/30">
								<TableCell className="px-4 py-3">
									<span className="font-mono text-xs font-bold text-gray-800">
										#{order.id.slice(0, 8).toUpperCase()}
									</span>
								</TableCell>
								<TableCell className="px-4 py-3 text-xs text-gray-500">
									{format(new Date(order.createdAt), 'dd MMM yyyy')}
									<br />
									<span className="text-[10px] text-gray-400">
										{format(new Date(order.createdAt), 'HH:mm')}
									</span>
								</TableCell>
								<TableCell className="px-4 py-3">
									<div className="flex items-center gap-1.5">
										{isMember ? (
											<BadgeCheckIcon className="h-3.5 w-3.5 shrink-0 text-green-600" />
										) : (
											<UserIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
										)}
										<span
											className={cn(
												'text-xs font-medium',
												isMember ? 'text-green-700' : 'text-gray-600'
											)}
										>
											{displayCustomer}
										</span>
									</div>
								</TableCell>
								<TableCell className="px-4 py-3">
									<div className="flex items-center gap-1.5">
										<ShieldCheckIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
										<span className="text-xs text-gray-600">
											{order.cashierName ?? '—'}
										</span>
									</div>
								</TableCell>
								<TableCell className="px-4 py-3">
									{PayIcon ? (
										<span className="flex items-center gap-1 text-xs text-gray-600">
											<PayIcon className="h-3.5 w-3.5" />
											{order.paymentMethod}
										</span>
									) : (
										<span className="text-xs text-gray-400">—</span>
									)}
								</TableCell>
								<TableCell className="px-4 py-3">
									<span className="flex items-center gap-1 text-xs text-gray-600">
										<PackageIcon className="h-3.5 w-3.5" />
										{order.itemCount ?? 0}
									</span>
								</TableCell>
								<TableCell className="px-4 py-3 font-mono text-xs text-gray-600">
									{formatCurrency(order.subtotal)}
								</TableCell>
								<TableCell className="px-4 py-3 font-mono text-xs text-amber-600">
									{formatCurrency(order.tax)}
								</TableCell>
								{showServiceCol && (
									<TableCell className="px-4 py-3 font-mono text-xs text-purple-600">
										{Number(order.serviceCharge) > 0
											? formatCurrency(order.serviceCharge!)
											: '—'}
									</TableCell>
								)}
								<TableCell className="px-4 py-3 font-mono text-sm font-bold text-green-700">
									{formatCurrency(order.total)}
								</TableCell>
								<TableCell className="px-4 py-3">
									<OrderStatusBadge
										status={
											order.status as
												| 'pending'
												| 'processing'
												| 'completed'
												| 'cancelled'
										}
									/>
								</TableCell>
							</TableRow>
						);
					})
				)}
			</TableBody>
		</Table>

		{totalPages > 1 && (
			<>
				<Separator />
				<div className="flex items-center justify-between px-4 py-3">
					<p className="text-xs text-gray-400">
						{total} orders · page {page} of {totalPages}
					</p>
					<div className="flex items-center gap-2">
						<Button
							size="sm"
							variant="outline"
							className="h-8 w-8 p-0"
							disabled={page <= 1}
							onClick={() => onPageChange(page - 1)}
						>
							<ChevronLeftIcon className="h-4 w-4" />
						</Button>
						<span className="min-w-[3rem] text-center text-xs font-medium">
							{page} / {totalPages}
						</span>
						<Button
							size="sm"
							variant="outline"
							className="h-8 w-8 p-0"
							disabled={page >= totalPages}
							onClick={() => onPageChange(page + 1)}
						>
							<ChevronRightIcon className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</>
		)}
	</div>
);
