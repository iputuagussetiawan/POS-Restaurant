'use client';
import { Separator } from '@/components/ui/separator';
import { OrderStatusBadge } from '@/modules/orders/ui/components/order-status-badge';
import {
	BanknoteIcon,
	CreditCardIcon,
	QrCodeIcon,
	ArrowRightLeftIcon,
	UserIcon,
	BadgeCheckIcon,
	ShieldCheckIcon,
	UtensilsCrossedIcon,
	PrinterIcon,
	PencilIcon,
	CheckIcon,
	XIcon,
	Loader2Icon,
	CheckCircle2Icon,
	RefreshCwIcon,
	XCircleIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useState } from 'react';
import { useTRPC } from '@/trpc/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

type PaymentMethod = 'cash' | 'card' | 'qris' | 'transfer';

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: React.ElementType }[] = [
	{ value: 'cash', label: 'Cash', icon: BanknoteIcon },
	{ value: 'card', label: 'Card', icon: CreditCardIcon },
	{ value: 'qris', label: 'QRIS', icon: QrCodeIcon },
	{ value: 'transfer', label: 'Transfer', icon: ArrowRightLeftIcon },
];

const PAYMENT_ICON: Record<string, React.ElementType> = {
	cash: BanknoteIcon,
	card: CreditCardIcon,
	qris: QrCodeIcon,
	transfer: ArrowRightLeftIcon,
};
const PAYMENT_LABEL: Record<string, string> = {
	cash: 'Cash',
	card: 'Card',
	qris: 'QRIS',
	transfer: 'Bank Transfer',
};

function formatUSD(n: number | string) {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 2,
	}).format(Number(n));
}

type OrderFull = {
	id: string;
	status: string;
	subtotal: string;
	tax: string;
	total: string;
	note?: string | null;
	paymentMethod?: string | null;
	customerName?: string | null;
	customerName2?: string | null;
	customerPhone?: string | null;
	customerEmail?: string | null;
	cashierName?: string | null;
	cashierEmail?: string | null;
	customerId?: string | null;
	createdAt: Date;
	items: {
		id: string;
		name: string;
		price: string;
		quantity: number;
		subtotal: string;
		productImageUrl?: string | null;
	}[];
};

interface ReceiptProps {
	order: OrderFull;
}

const Receipt = ({ order }: ReceiptProps) => {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const { data: company } = useQuery(trpc.company.get.queryOptions());
	const companyName = company?.name ?? 'FoodOrder';
	const receiptFooter = company?.receiptFooter ?? '© FoodOrder · Green Line Software';
	const logoUrl = company?.logoUrl ?? null;

	const isMember = !!order.customerId && !!order.customerName2;
	const displayCustomer = order.customerName2 ?? order.customerName ?? 'Walk-in Customer';

	const [editingPayment, setEditingPayment] = useState(false);
	const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(
		(order.paymentMethod as PaymentMethod) ?? 'cash'
	);

	const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
	const [cancelReason, setCancelReason] = useState('');

	const CANCEL_PRESETS = [
		'Customer changed mind',
		'Item out of stock',
		'Duplicate order',
		'Payment failed',
		'Wrong order placed',
	];

	const updatePayment = useMutation(
		trpc.orders.updatePaymentMethod.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.orders.getOne.queryKey({ id: order.id }),
				});
				toast.success('Payment method updated');
				setEditingPayment(false);
			},
			onError: (e) => toast.error(e.message),
		})
	);

	const updateStatus = useMutation(
		trpc.orders.updateStatus.mutationOptions({
			onSuccess: (_, vars) => {
				queryClient.invalidateQueries({
					queryKey: trpc.orders.getOne.queryKey({ id: order.id }),
				});
				queryClient.invalidateQueries({ queryKey: trpc.orders.getMany.queryKey() });
				toast.success(`Order marked as ${vars.status}`);
			},
			onError: (e) => toast.error(e.message),
		})
	);

	type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

	const STATUS_ACTIONS: Record<
		string,
		{ label: string; next: OrderStatus; icon: React.ElementType; className: string }[]
	> = {
		pending: [
			{
				label: 'Mark Processing',
				next: 'processing',
				icon: RefreshCwIcon,
				className: 'bg-blue-600 hover:bg-blue-700 text-white',
			},
			{
				label: 'Cancel',
				next: 'cancelled',
				icon: XCircleIcon,
				className: 'bg-red-100 hover:bg-red-200 text-red-600',
			},
		],
		processing: [
			{
				label: 'Mark Completed',
				next: 'completed',
				icon: CheckCircle2Icon,
				className: 'bg-green-600 hover:bg-green-700 text-white',
			},
			{
				label: 'Cancel',
				next: 'cancelled',
				icon: XCircleIcon,
				className: 'bg-red-100 hover:bg-red-200 text-red-600',
			},
		],
		completed: [],
		cancelled: [],
	};

	const handleSavePayment = () => {
		updatePayment.mutate({ id: order.id, paymentMethod: selectedMethod });
	};

	const handleCancelEdit = () => {
		setSelectedMethod((order.paymentMethod as PaymentMethod) ?? 'cash');
		setEditingPayment(false);
	};

	const currentMethod = editingPayment
		? selectedMethod
		: (order.paymentMethod as PaymentMethod | null | undefined);
	const PayIcon = currentMethod ? PAYMENT_ICON[currentMethod] : BanknoteIcon;

	return (
		<div className="flex flex-col gap-4">
			{/* Action bar — hidden on print */}
			<div className="flex items-center justify-between gap-2 print:hidden">
				{/* Status actions */}
				<div className="flex items-center gap-2">
					{(STATUS_ACTIONS[order.status] ?? []).map((a) => {
						const Icon = a.icon;
						const isLoading =
							updateStatus.isPending && updateStatus.variables?.status === a.next;
						const handleClick = () => {
							if (a.next === 'cancelled') {
								setCancelReason('');
								setCancelDialogOpen(true);
							} else {
								updateStatus.mutate({ id: order.id, status: a.next });
							}
						};
						return (
							<Button
								key={a.next}
								size="sm"
								disabled={updateStatus.isPending}
								onClick={handleClick}
								className={cn(
									'gap-1.5 rounded-full text-xs font-semibold',
									a.className
								)}
							>
								{isLoading ? (
									<Loader2Icon className="h-3.5 w-3.5 animate-spin" />
								) : (
									<Icon className="h-3.5 w-3.5" />
								)}
								{a.label}
							</Button>
						);
					})}
					{(STATUS_ACTIONS[order.status] ?? []).length === 0 && (
						<span
							className={cn(
								'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold',
								order.status === 'completed'
									? 'bg-green-100 text-green-700'
									: 'bg-red-100 text-red-600'
							)}
						>
							{order.status === 'completed' ? (
								<>
									<CheckCircle2Icon className="h-3.5 w-3.5" />
									Completed
								</>
							) : (
								<>
									<XCircleIcon className="h-3.5 w-3.5" />
									Cancelled
								</>
							)}
						</span>
					)}
				</div>

				<Button
					variant="outline"
					size="sm"
					className="gap-1.5"
					onClick={() => window.print()}
				>
					<PrinterIcon className="h-4 w-4" />
					Print
				</Button>
			</div>

			{/* Receipt card */}
			<div
				id="receipt"
				className="mx-auto w-full max-w-sm rounded-2xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.10)] print:rounded-none print:shadow-none"
			>
				{/* Brand header */}
				<div className="flex flex-col items-center gap-2 rounded-t-2xl bg-green-700 px-6 py-6 text-white print:rounded-none">
					{logoUrl ? (
						<div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-white/20">
							<Image
								src={logoUrl}
								alt={companyName}
								fill
								className="object-contain p-1"
							/>
						</div>
					) : (
						<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
							<UtensilsCrossedIcon className="h-6 w-6 text-white" />
						</div>
					)}
					<p className="text-xl font-bold tracking-tight">{companyName}</p>
					<p className="text-xs text-green-200">Official Receipt</p>
				</div>

				<div className="flex flex-col gap-4 px-6 py-5">
					{/* Order ID + date + status */}
					<div className="flex items-center justify-between">
						<div>
							<p className="font-mono text-sm font-bold text-gray-800">
								#{order.id.slice(0, 8).toUpperCase()}
							</p>
							<p className="text-xs text-gray-400">
								{format(new Date(order.createdAt), 'dd MMM yyyy, HH:mm')}
							</p>
						</div>
						<OrderStatusBadge
							status={
								order.status as 'pending' | 'processing' | 'completed' | 'cancelled'
							}
						/>
					</div>

					<Separator />

					{/* Customer */}
					<div className="flex items-start gap-2">
						{isMember ? (
							<BadgeCheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
						) : (
							<UserIcon className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
						)}
						<div className="min-w-0 flex-1">
							<p
								className={cn(
									'text-sm font-semibold',
									isMember ? 'text-green-700' : 'text-gray-800'
								)}
							>
								{displayCustomer}
							</p>
							{order.customerPhone && (
								<p className="text-xs text-gray-400">{order.customerPhone}</p>
							)}
							{order.customerEmail && (
								<p className="text-xs text-gray-400">{order.customerEmail}</p>
							)}
						</div>
						{isMember && (
							<span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
								MEMBER
							</span>
						)}
					</div>

					<Separator />

					{/* Items */}
					<div className="flex flex-col gap-3">
						<p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
							Order Items
						</p>
						{order.items.map((item) => (
							<div key={item.id} className="flex items-center gap-3">
								{item.productImageUrl ? (
									<Image
										src={item.productImageUrl}
										alt={item.name}
										width={36}
										height={36}
										className="h-9 w-9 shrink-0 rounded-lg object-cover"
									/>
								) : (
									<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-base">
										🍽️
									</div>
								)}
								<div className="flex min-w-0 flex-1 items-start justify-between gap-2">
									<div className="min-w-0">
										<p className="truncate text-sm font-medium text-gray-800">
											{item.name}
										</p>
										<p className="text-xs text-gray-400">
											{formatUSD(item.price)} × {item.quantity}
										</p>
									</div>
									<p className="shrink-0 text-sm font-semibold text-gray-800">
										{formatUSD(item.subtotal)}
									</p>
								</div>
							</div>
						))}
					</div>

					<Separator />

					{/* Totals */}
					<div className="space-y-2">
						<div className="flex justify-between text-sm text-gray-500">
							<span>Subtotal</span>
							<span>{formatUSD(order.subtotal)}</span>
						</div>
						<div className="flex justify-between text-sm text-gray-500">
							<span>Tax (10%)</span>
							<span>{formatUSD(order.tax)}</span>
						</div>
						<div className="flex justify-between pt-1 text-base font-bold text-gray-900">
							<span>Total</span>
							<span className="text-green-700">{formatUSD(order.total)}</span>
						</div>
					</div>

					<Separator />

					{/* Payment method — editable */}
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<span className="text-xs text-gray-400">Payment</span>
							{!editingPayment ? (
								<div className="flex items-center gap-2">
									<span className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
										{currentMethod && <PayIcon className="h-3.5 w-3.5" />}
										{currentMethod ? PAYMENT_LABEL[currentMethod] : 'Not set'}
									</span>
									<button
										onClick={() => setEditingPayment(true)}
										className="flex items-center gap-1 rounded-lg bg-gray-100 px-2 py-1 text-[10px] font-semibold text-gray-600 transition-colors hover:bg-gray-200 print:hidden"
									>
										<PencilIcon className="h-3 w-3" />
										Change
									</button>
								</div>
							) : (
								<div className="flex items-center gap-1.5">
									<button
										onClick={handleCancelEdit}
										disabled={updatePayment.isPending}
										className="flex h-6 w-6 items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200"
									>
										<XIcon className="h-3 w-3" />
									</button>
									<button
										onClick={handleSavePayment}
										disabled={updatePayment.isPending}
										className="flex h-6 items-center gap-1 rounded-lg bg-green-600 px-2 text-[10px] font-semibold text-white hover:bg-green-700"
									>
										{updatePayment.isPending ? (
											<Loader2Icon className="h-3 w-3 animate-spin" />
										) : (
											<>
												<CheckIcon className="h-3 w-3" />
												Save
											</>
										)}
									</button>
								</div>
							)}
						</div>

						{/* Payment method picker — shown when editing */}
						{editingPayment && (
							<div className="grid grid-cols-2 gap-1.5 print:hidden">
								{PAYMENT_METHODS.map((m) => {
									const Icon = m.icon;
									const isSelected = selectedMethod === m.value;
									return (
										<button
											key={m.value}
											onClick={() => setSelectedMethod(m.value)}
											className={cn(
												'flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-medium transition-all',
												isSelected
													? 'border-green-600 bg-green-50 text-green-700'
													: 'border-gray-100 bg-white text-gray-600 hover:border-gray-200 hover:bg-gray-50'
											)}
										>
											<Icon
												className={cn(
													'h-3.5 w-3.5 shrink-0',
													isSelected ? 'text-green-600' : 'text-gray-400'
												)}
											/>
											{m.label}
											{isSelected && (
												<CheckIcon className="ml-auto h-3 w-3 text-green-600" />
											)}
										</button>
									);
								})}
							</div>
						)}

						{/* Cashier */}
						<div className="flex items-center justify-between">
							<span className="text-xs text-gray-400">Served by</span>
							<span className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
								<ShieldCheckIcon className="h-3.5 w-3.5 text-gray-400" />
								{order.cashierName ?? '—'}
							</span>
						</div>
					</div>

					{order.note && (
						<>
							<Separator />
							<div>
								<p className="mb-1 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
									Note
								</p>
								<p className="text-xs text-gray-500 italic">"{order.note}"</p>
							</div>
						</>
					)}

					<Separator />

					{/* Footer */}
					<div className="flex flex-col items-center gap-1 py-1 text-center">
						<p className="text-xs font-semibold text-gray-700">
							Thank you for your order!
						</p>
						<p className="text-[11px] text-gray-400">
							{receiptFooter || `© ${new Date().getFullYear()} ${companyName}`}
						</p>
					</div>
				</div>
			</div>

			{/* Cancel reason dialog */}
			<Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
				<DialogContent className="max-w-sm overflow-hidden p-0">
					<DialogHeader className="border-b px-6 pt-6 pb-4">
						<DialogTitle className="flex items-center gap-2 text-red-600">
							<XCircleIcon className="h-5 w-5" />
							Cancel Order
						</DialogTitle>
					</DialogHeader>

					<div className="flex flex-col gap-4 px-6 py-5">
						<p className="text-sm text-gray-600">
							Please provide a reason for cancelling order{' '}
							<span className="font-mono font-bold text-gray-800">
								#{order.id.slice(0, 8).toUpperCase()}
							</span>
						</p>

						{/* Quick presets */}
						<div>
							<Label className="mb-2 block text-xs font-semibold tracking-wider text-gray-400 uppercase">
								Quick select
							</Label>
							<div className="flex flex-wrap gap-1.5">
								{CANCEL_PRESETS.map((preset) => (
									<button
										key={preset}
										onClick={() => setCancelReason(preset)}
										className={cn(
											'rounded-full border px-3 py-1 text-xs font-medium transition-all',
											cancelReason === preset
												? 'border-red-500 bg-red-50 text-red-700'
												: 'border-gray-200 bg-white text-gray-600 hover:border-red-300 hover:text-red-600'
										)}
									>
										{preset}
									</button>
								))}
							</div>
						</div>

						{/* Free text */}
						<div>
							<Label className="mb-2 block text-xs font-semibold tracking-wider text-gray-400 uppercase">
								Or type reason
							</Label>
							<Textarea
								value={cancelReason}
								onChange={(e) => setCancelReason(e.target.value)}
								placeholder="Describe the cancellation reason..."
								rows={3}
								className="resize-none border-gray-200 text-sm shadow-none focus-visible:border-red-400 focus-visible:ring-0"
							/>
						</div>
					</div>

					<DialogFooter className="flex gap-2 border-t px-6 py-4">
						<Button
							variant="outline"
							className="flex-1"
							onClick={() => setCancelDialogOpen(false)}
							disabled={updateStatus.isPending}
						>
							Back
						</Button>
						<Button
							disabled={!cancelReason.trim() || updateStatus.isPending}
							onClick={() => {
								updateStatus.mutate({
									id: order.id,
									status: 'cancelled',
									cancelReason: cancelReason.trim(),
								});
								setCancelDialogOpen(false);
							}}
							className="flex-1 bg-red-600 font-semibold text-white hover:bg-red-700"
						>
							{updateStatus.isPending ? (
								<Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<XCircleIcon className="mr-2 h-4 w-4" />
							)}
							Confirm Cancel
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default Receipt;
