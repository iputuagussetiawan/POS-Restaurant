'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
	BanknoteIcon,
	CreditCardIcon,
	QrCodeIcon,
	ArrowRightLeftIcon,
	UserIcon,
	Loader2Icon,
	CheckCircleIcon,
	XIcon,
	TicketPercentIcon,
	ArrowRightIcon,
} from 'lucide-react';
import { useState } from 'react';
import { useTRPC } from '@/trpc/client';
import { useQueryClient } from '@tanstack/react-query';
import { useShopCurrency } from '../../hooks/use-shop-currency';

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
}[] = [
	{ value: 'cash', label: 'Cash', icon: BanknoteIcon, desc: 'Pay at counter' },
	{ value: 'card', label: 'Card', icon: CreditCardIcon, desc: 'Debit / credit' },
	{ value: 'qris', label: 'QRIS', icon: QrCodeIcon, desc: 'Scan QR' },
	{ value: 'transfer', label: 'Transfer', icon: ArrowRightLeftIcon, desc: 'Bank transfer' },
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
			<DialogContent className="max-w-md overflow-hidden p-0">
				<DialogHeader className="border-b px-6 pt-5 pb-4">
					<DialogTitle className="text-base font-semibold">Checkout</DialogTitle>
				</DialogHeader>

				<div className="flex max-h-[70vh] flex-col gap-5 overflow-y-auto px-6 py-5">
					{/* Order summary */}
					<div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
						<p className="mb-2.5 text-xs font-semibold tracking-wider text-gray-400 uppercase">
							Order Summary
						</p>
						<div className="space-y-1.5 text-sm">
							<div className="flex justify-between text-gray-500">
								<span>Subtotal</span>
								<span>{format(subtotal)}</span>
							</div>
							{taxRate > 0 && (
								<div className="flex justify-between text-gray-500">
									<span>Tax ({taxRate}%)</span>
									<span>{format(tax)}</span>
								</div>
							)}
							{serviceRate > 0 && (
								<div className="flex justify-between text-gray-500">
									<span>Service ({serviceRate}%)</span>
									<span>{format(serviceCharge)}</span>
								</div>
							)}
							{appliedDiscount && (
								<div className="flex justify-between font-medium text-green-700">
									<span className="flex items-center gap-1">
										<TicketPercentIcon className="h-3.5 w-3.5" />
										{appliedDiscount.code}
									</span>
									<span>-{format(discountAmount)}</span>
								</div>
							)}
							<Separator className="my-1.5" />
							<div className="flex justify-between text-base font-bold">
								<span className="text-gray-900">Total</span>
								<span className="text-green-700">{format(finalTotal)}</span>
							</div>
						</div>
					</div>

					{/* Discount code */}
					<div>
						<Label className="mb-2 block text-xs font-semibold tracking-wider text-gray-400 uppercase">
							Promo Code{' '}
							<span className="font-normal text-gray-300 normal-case">
								(optional)
							</span>
						</Label>
						{appliedDiscount ? (
							<div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2.5">
								<TicketPercentIcon className="h-4 w-4 shrink-0 text-green-600" />
								<div className="min-w-0 flex-1">
									<p className="text-xs font-semibold text-green-800">
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
									className="rounded-md p-0.5 text-green-500 hover:text-green-700"
								>
									<XIcon className="h-4 w-4" />
								</button>
							</div>
						) : (
							<div className="flex gap-2">
								<div className="relative flex-1">
									<TicketPercentIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
									<Input
										value={discountInput}
										onChange={(e) =>
											setDiscountInput(
												e.target.value.toUpperCase().replace(/\s/g, '')
											)
										}
										onKeyDown={(e) => e.key === 'Enter' && applyDiscount()}
										placeholder="Enter promo code"
										className="h-9 border-gray-200 pl-9 font-mono text-sm uppercase shadow-none focus-visible:border-green-500 focus-visible:ring-0"
									/>
								</div>
								<Button
									type="button"
									variant="outline"
									size="sm"
									className="h-9 shrink-0 px-4"
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
							<p className="mt-1.5 text-xs text-red-500">{discountError}</p>
						)}
					</div>

					{/* Payment method */}
					<div>
						<Label className="mb-2 block text-xs font-semibold tracking-wider text-gray-400 uppercase">
							Payment Method
						</Label>
						<div className="grid grid-cols-2 gap-2">
							{PAYMENT_METHODS.map((m) => {
								const Icon = m.icon;
								const isSelected = method === m.value;
								return (
									<button
										key={m.value}
										onClick={() => setMethod(m.value)}
										className={cn(
											'flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all',
											isSelected
												? 'border-green-500 bg-green-50 text-green-700'
												: 'border-gray-100 bg-white text-gray-600 hover:border-gray-200 hover:bg-gray-50'
										)}
									>
										<div
											className={cn(
												'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
												isSelected ? 'bg-green-600' : 'bg-gray-100'
											)}
										>
											<Icon
												className={cn(
													'h-4 w-4',
													isSelected ? 'text-white' : 'text-gray-500'
												)}
											/>
										</div>
										<div className="min-w-0">
											<p className="text-xs leading-tight font-semibold">
												{m.label}
											</p>
											<p className="text-[10px] leading-tight text-gray-400">
												{m.desc}
											</p>
										</div>
										{isSelected && (
											<CheckCircleIcon className="ml-auto h-4 w-4 shrink-0 text-green-500" />
										)}
									</button>
								);
							})}
						</div>
					</div>

					{/* Name */}
					<div>
						<Label className="mb-2 block text-xs font-semibold tracking-wider text-gray-400 uppercase">
							Your Name{' '}
							<span className="font-normal text-gray-300 normal-case">
								(optional)
							</span>
						</Label>
						<div className="relative">
							<UserIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
							<Input
								value={customerName}
								onChange={(e) => setCustomerName(e.target.value)}
								placeholder="e.g. John"
								className="h-9 border-gray-200 pl-9 text-sm shadow-none focus-visible:border-green-500 focus-visible:ring-0"
							/>
						</div>
					</div>

					{/* Note */}
					<div>
						<Label className="mb-2 block text-xs font-semibold tracking-wider text-gray-400 uppercase">
							Note{' '}
							<span className="font-normal text-gray-300 normal-case">
								(optional)
							</span>
						</Label>
						<Input
							value={note}
							onChange={(e) => setNote(e.target.value)}
							placeholder="e.g. no spicy, extra sauce…"
							className="h-9 border-gray-200 text-sm shadow-none focus-visible:border-green-500 focus-visible:ring-0"
						/>
					</div>
				</div>

				{/* Footer */}
				<div className="flex gap-2 border-t px-6 py-4">
					<Button
						variant="outline"
						className="flex-1"
						onClick={handleClose}
						disabled={isPending}
					>
						Back
					</Button>
					<Button
						className="flex-1 bg-green-600 font-semibold text-white hover:bg-green-700"
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
								Placing…
							</>
						) : (
							<>
								Place order
								<ArrowRightIcon className="ml-2 h-4 w-4" />
							</>
						)}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default ShopPaymentModal;
