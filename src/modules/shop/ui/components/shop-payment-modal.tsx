'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
	BanknoteIcon,
	CreditCardIcon,
	QrCodeIcon,
	ArrowRightLeftIcon,
	UserIcon,
	Loader2Icon,
	CheckIcon,
	XIcon,
	TicketPercentIcon,
	StickyNoteIcon,
	ShoppingBagIcon,
	ChevronRightIcon,
} from 'lucide-react';
import { useState } from 'react';
import { useTRPC } from '@/trpc/client';
import { useQueryClient } from '@tanstack/react-query';
import { useShopCurrency } from '../../hooks/use-shop-currency';
import { useCartStore } from '@/modules/pos/store/use-cart-store';

type PaymentMethod = 'cash' | 'card' | 'qris' | 'transfer';

interface ShopPaymentModalProps {
	open: boolean;
	onClose: () => void;
	onConfirm: (data: {
		paymentMethod: PaymentMethod;
		customerName: string;
		customerId?: string;
		note: string;
		discountCode?: string;
	}) => void;
	isPending: boolean;
	subtotal: number;
	tax: number;
	taxRate: number;
	serviceCharge: number;
	serviceRate: number;
	total: number;
}

const PAYMENT_METHODS: {
	value: PaymentMethod;
	label: string;
	icon: React.ElementType;
	desc: string;
	color: string;
	bg: string;
}[] = [
	{
		value: 'cash',
		label: 'Cash',
		icon: BanknoteIcon,
		desc: 'Pay at counter',
		color: 'text-emerald-600',
		bg: 'bg-emerald-50',
	},
	{
		value: 'card',
		label: 'Card',
		icon: CreditCardIcon,
		desc: 'Debit / credit',
		color: 'text-blue-600',
		bg: 'bg-blue-50',
	},
	{
		value: 'qris',
		label: 'QRIS',
		icon: QrCodeIcon,
		desc: 'Scan QR code',
		color: 'text-violet-600',
		bg: 'bg-violet-50',
	},
	{
		value: 'transfer',
		label: 'Transfer',
		icon: ArrowRightLeftIcon,
		desc: 'Bank transfer',
		color: 'text-orange-600',
		bg: 'bg-orange-50',
	},
];

const ShopPaymentModal = ({
	open,
	onClose,
	onConfirm,
	isPending,
	subtotal,
	tax,
	taxRate,
	serviceCharge,
	serviceRate,
	total,
}: ShopPaymentModalProps) => {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { format } = useShopCurrency();
	const items = useCartStore((s) => s.items);
	const totalQty = items.reduce((s, i) => s + i.quantity, 0);

	const [method, setMethod] = useState<PaymentMethod>('cash');
	const [customerName, setCustomerName] = useState('');
	const [note, setNote] = useState('');
	const [discountInput, setDiscountInput] = useState('');
	const [appliedDiscount, setAppliedDiscount] = useState<{
		code: string;
		type: 'percentage' | 'fixed';
		value: number;
		discountAmount: number;
	} | null>(null);
	const [discountError, setDiscountError] = useState('');
	const [discountChecking, setDiscountChecking] = useState(false);

	const discountAmount = appliedDiscount?.discountAmount ?? 0;
	const finalTotal = Math.max(0, total - discountAmount);

	const clearDiscount = () => {
		setDiscountInput('');
		setAppliedDiscount(null);
		setDiscountError('');
	};

	const applyDiscount = async () => {
		const code = discountInput.trim().toUpperCase();
		if (!code) return;
		setDiscountError('');
		setDiscountChecking(true);
		try {
			const discount = await queryClient.fetchQuery(
				trpc.discounts.getByCode.queryOptions({ code })
			);
			const amt =
				discount.type === 'percentage'
					? (total * Number(discount.value)) / 100
					: Number(discount.value);
			setAppliedDiscount({
				code: discount.code,
				type: discount.type,
				value: Number(discount.value),
				discountAmount: Math.min(amt, total),
			});
			setDiscountInput(discount.code);
		} catch (e: unknown) {
			const msg =
				e instanceof Error
					? e.message.replace(/^TRPCClientError: /, '')
					: 'Invalid discount code.';
			setDiscountError(msg);
			setAppliedDiscount(null);
		} finally {
			setDiscountChecking(false);
		}
	};

	const handleClose = () => {
		setCustomerName('');
		setNote('');
		setMethod('cash');
		clearDiscount();
		onClose();
	};

	return (
		<Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
			<DialogContent className="flex max-h-[90vh] max-w-md flex-col gap-0 overflow-hidden p-0">
				{/* Header */}
				<DialogHeader className="shrink-0 border-b px-5 py-4">
					<div className="flex items-center gap-2.5">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50">
							<ShoppingBagIcon className="h-4 w-4 text-green-600" />
						</div>
						<div>
							<DialogTitle className="text-sm leading-none font-bold text-gray-900">
								Complete Your Order
							</DialogTitle>
							<p className="mt-0.5 text-[11px] text-gray-400">
								{totalQty} item{totalQty !== 1 ? 's' : ''} · review &amp; pay
							</p>
						</div>
					</div>
				</DialogHeader>

				{/* Scrollable body */}
				<div className="flex-1 overflow-y-auto">
					<div className="flex flex-col gap-0 divide-y divide-gray-50">
						{/* ── Order summary ── */}
						<div className="px-5 py-4">
							<p className="mb-3 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
								Order Summary
							</p>
							<div className="space-y-2">
								<div className="flex justify-between text-sm text-gray-500">
									<span>Subtotal</span>
									<span className="font-medium text-gray-700">
										{format(subtotal)}
									</span>
								</div>
								{taxRate > 0 && (
									<div className="flex justify-between text-sm text-gray-500">
										<span>Tax ({taxRate}%)</span>
										<span>{format(tax)}</span>
									</div>
								)}
								{serviceRate > 0 && (
									<div className="flex justify-between text-sm text-gray-500">
										<span>Service ({serviceRate}%)</span>
										<span>{format(serviceCharge)}</span>
									</div>
								)}
								{appliedDiscount && (
									<div className="flex justify-between text-sm font-semibold text-green-600">
										<span className="flex items-center gap-1">
											<TicketPercentIcon className="h-3.5 w-3.5" />
											{appliedDiscount.code}
										</span>
										<span>-{format(discountAmount)}</span>
									</div>
								)}
							</div>
						</div>

						{/* ── Promo code ── */}
						<div className="px-5 py-4">
							<p className="mb-3 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
								Promo Code
							</p>
							{appliedDiscount ? (
								<div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-3.5 py-2.5">
									<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-green-100">
										<TicketPercentIcon className="h-3.5 w-3.5 text-green-600" />
									</div>
									<div className="min-w-0 flex-1">
										<p className="text-xs font-bold text-green-800">
											{appliedDiscount.code}
										</p>
										<p className="text-[11px] text-green-600">
											{appliedDiscount.type === 'percentage'
												? `${appliedDiscount.value}% off`
												: `${format(appliedDiscount.value)} off`}
											{' · '}saving {format(discountAmount)}
										</p>
									</div>
									<button
										onClick={clearDiscount}
										className="rounded-md p-1 text-green-400 hover:bg-green-100 hover:text-green-700"
									>
										<XIcon className="h-3.5 w-3.5" />
									</button>
								</div>
							) : (
								<div className="flex gap-2">
									<div className="relative flex-1">
										<TicketPercentIcon className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-gray-300" />
										<Input
											value={discountInput}
											onChange={(e) =>
												setDiscountInput(
													e.target.value.toUpperCase().replace(/\s/g, '')
												)
											}
											onKeyDown={(e) => e.key === 'Enter' && applyDiscount()}
											placeholder="Enter promo code"
											className="h-9 rounded-lg border-gray-200 pl-9 font-mono text-sm uppercase shadow-none focus-visible:border-green-500 focus-visible:ring-0"
										/>
									</div>
									<Button
										type="button"
										variant="outline"
										size="sm"
										className="h-9 shrink-0 rounded-lg border-gray-200 px-4 text-xs font-semibold"
										onClick={applyDiscount}
										disabled={!discountInput.trim() || discountChecking}
									>
										{discountChecking ? (
											<Loader2Icon className="h-3.5 w-3.5 animate-spin" />
										) : (
											'Apply'
										)}
									</Button>
								</div>
							)}
							{discountError && (
								<p className="mt-1.5 flex items-center gap-1 text-[11px] text-red-500">
									<XIcon className="h-3 w-3 shrink-0" />
									{discountError}
								</p>
							)}
						</div>

						{/* ── Payment method ── */}
						<div className="px-5 py-4">
							<p className="mb-3 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
								Payment Method
							</p>
							<div className="grid grid-cols-2 gap-2">
								{PAYMENT_METHODS.map((m) => {
									const Icon = m.icon;
									const isSelected = method === m.value;
									return (
										<button
											key={m.value}
											onClick={() => setMethod(m.value)}
											className={cn(
												'relative flex items-center gap-3 rounded-xl border p-3 text-left transition-all',
												isSelected
													? 'border-green-500 bg-green-50'
													: 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
											)}
										>
											<div
												className={cn(
													'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
													isSelected ? 'bg-green-600' : m.bg
												)}
											>
												<Icon
													className={cn(
														'h-4 w-4',
														isSelected ? 'text-white' : m.color
													)}
												/>
											</div>
											<div className="min-w-0 flex-1">
												<p
													className={cn(
														'text-xs leading-tight font-bold',
														isSelected
															? 'text-green-800'
															: 'text-gray-700'
													)}
												>
													{m.label}
												</p>
												<p className="text-[10px] leading-tight text-gray-400">
													{m.desc}
												</p>
											</div>
											{isSelected && (
												<div className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-green-600">
													<CheckIcon className="h-2.5 w-2.5 text-white" />
												</div>
											)}
										</button>
									);
								})}
							</div>
						</div>

						{/* ── Customer details ── */}
						<div className="px-5 py-4">
							<p className="mb-3 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
								Details{' '}
								<span className="font-normal text-gray-300 normal-case">
									(optional)
								</span>
							</p>
							<div className="flex flex-col gap-3">
								<div className="relative">
									<UserIcon className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-gray-300" />
									<Input
										value={customerName}
										onChange={(e) => setCustomerName(e.target.value)}
										placeholder="Your name (e.g. John)"
										className="h-9 rounded-lg border-gray-200 pl-9 text-sm shadow-none focus-visible:border-green-500 focus-visible:ring-0"
									/>
								</div>
								<div className="relative">
									<StickyNoteIcon className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-gray-300" />
									<Input
										value={note}
										onChange={(e) => setNote(e.target.value)}
										placeholder="Order note (e.g. no spicy)"
										className="h-9 rounded-lg border-gray-200 pl-9 text-sm shadow-none focus-visible:border-green-500 focus-visible:ring-0"
									/>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* ── Sticky footer ── */}
				<div className="shrink-0 border-t bg-white px-5 py-4">
					{/* Total row */}
					<div className="mb-3 flex items-center justify-between">
						<div>
							<p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
								Total to pay
							</p>
							<p className="text-xl font-bold text-gray-900">{format(finalTotal)}</p>
						</div>
						{appliedDiscount && (
							<div className="rounded-lg bg-green-50 px-2.5 py-1.5 text-right">
								<p className="text-[10px] text-green-600">You save</p>
								<p className="text-sm font-bold text-green-700">
									{format(discountAmount)}
								</p>
							</div>
						)}
					</div>

					<div className="flex gap-2">
						<Button
							variant="outline"
							className="h-10 shrink-0 rounded-xl border-gray-200 px-4 text-sm font-medium"
							onClick={handleClose}
							disabled={isPending}
						>
							Back
						</Button>
						<Button
							className="h-10 flex-1 rounded-xl bg-green-600 font-semibold text-white hover:bg-green-700 disabled:opacity-60"
							onClick={() =>
								onConfirm({
									paymentMethod: method,
									customerName,
									note,
									discountCode: appliedDiscount?.code,
								})
							}
							disabled={isPending}
						>
							{isPending ? (
								<>
									<Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
									Placing order…
								</>
							) : (
								<>
									Place Order
									<ChevronRightIcon className="ml-1.5 h-4 w-4" />
								</>
							)}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default ShopPaymentModal;
