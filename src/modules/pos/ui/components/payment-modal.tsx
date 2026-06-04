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
	PhoneIcon,
	Loader2Icon,
	CheckCircleIcon,
	SearchIcon,
	BadgeCheckIcon,
	XIcon,
	TicketPercentIcon,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTRPC } from '@/trpc/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/use-debounce';
import { authClient } from '@/lib/auth-client';
import { useCurrency } from '@/modules/company/hooks/use-currency';

type PaymentMethod = 'cash' | 'card' | 'qris' | 'transfer';

interface PaymentModalProps {
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
	{ value: 'cash', label: 'Cash', icon: BanknoteIcon, desc: 'Physical cash' },
	{ value: 'card', label: 'Card', icon: CreditCardIcon, desc: 'Debit / credit' },
	{ value: 'qris', label: 'QRIS', icon: QrCodeIcon, desc: 'Scan QR code' },
	{
		value: 'transfer',
		label: 'Bank Transfer',
		icon: ArrowRightLeftIcon,
		desc: 'Direct transfer',
	},
];

const PaymentModal = ({
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
}: PaymentModalProps) => {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { format: formatCurrency } = useCurrency();
	const { data: session } = authClient.useSession();

	const [method, setMethod] = useState<PaymentMethod>('cash');
	const [phone, setPhone] = useState('');
	const [customerName, setCustomerName] = useState('');
	const [customerId, setCustomerId] = useState<string | undefined>();
	const [isMember, setIsMember] = useState(false);
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

	const debouncedPhone = useDebounce(phone, 500);

	const { data: foundCustomer, isFetching: lookingUp } = useQuery({
		...trpc.customers.getByPhone.queryOptions({ phone: debouncedPhone || 'x' }),
		enabled: debouncedPhone.length >= 6,
		retry: false,
	});

	useEffect(() => {
		if (foundCustomer) {
			setCustomerName(foundCustomer.name);
			setCustomerId(foundCustomer.id);
			setIsMember(true);
		} else if (debouncedPhone.length >= 6) {
			setCustomerName('');
			setCustomerId(undefined);
			setIsMember(false);
		}
	}, [foundCustomer, debouncedPhone]);

	const clearPhone = () => {
		setPhone('');
		setCustomerName('');
		setCustomerId(undefined);
		setIsMember(false);
	};

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
			const preTaxTotal = total;
			const amt =
				discount.type === 'percentage'
					? (preTaxTotal * Number(discount.value)) / 100
					: Number(discount.value);
			setAppliedDiscount({
				code: discount.code,
				type: discount.type,
				value: Number(discount.value),
				discountAmount: Math.min(amt, preTaxTotal),
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

	const discountAmount = appliedDiscount?.discountAmount ?? 0;
	const finalTotal = Math.max(0, total - discountAmount);

	const handleClose = () => {
		clearPhone();
		clearDiscount();
		setNote('');
		setMethod('cash');
		onClose();
	};

	const handleConfirm = () => {
		onConfirm({
			paymentMethod: method,
			customerName,
			customerId,
			note,
			discountCode: appliedDiscount?.code,
		});
	};

	return (
		<Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
			<DialogContent className="max-w-lg overflow-hidden p-0">
				<DialogHeader className="border-b px-6 pt-6 pb-4">
					<DialogTitle className="text-base font-semibold">Confirm Payment</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col gap-5 px-6 py-5">
					{/* Order summary */}
					<div className="space-y-2 rounded-xl bg-gray-50 px-4 py-3">
						<div className="flex justify-between text-sm text-gray-500">
							<span>Subtotal</span>
							<span>{formatCurrency(subtotal)}</span>
						</div>
						<div className="flex justify-between text-sm text-gray-500">
							<span>Tax ({taxRate}%)</span>
							<span>{formatCurrency(tax)}</span>
						</div>
						{serviceRate > 0 && (
							<div className="flex justify-between text-sm text-gray-500">
								<span>Service ({serviceRate}%)</span>
								<span>{formatCurrency(serviceCharge)}</span>
							</div>
						)}
						{appliedDiscount && (
							<div className="flex justify-between text-sm font-medium text-green-700">
								<span className="flex items-center gap-1.5">
									<TicketPercentIcon className="h-3.5 w-3.5" />
									Discount ({appliedDiscount.code})
								</span>
								<span>-{formatCurrency(discountAmount)}</span>
							</div>
						)}
						<Separator className="my-1" />
						<div className="flex justify-between text-base font-bold">
							<span className="text-gray-900">Total</span>
							<span className="text-green-700">{formatCurrency(finalTotal)}</span>
						</div>
					</div>

					{/* Discount code */}
					<div>
						<Label className="mb-2 block text-xs font-semibold tracking-wider text-gray-400 uppercase">
							Discount Code
							<span className="ml-1 font-normal normal-case">(optional)</span>
						</Label>
						{appliedDiscount ? (
							<div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
								<TicketPercentIcon className="h-4 w-4 shrink-0 text-green-600" />
								<div className="min-w-0 flex-1">
									<p className="text-xs font-semibold text-green-800">
										{appliedDiscount.code}
									</p>
									<p className="text-[10px] text-green-600">
										{appliedDiscount.type === 'percentage'
											? `${appliedDiscount.value}% off`
											: `${formatCurrency(appliedDiscount.value)} off`}
										{' · '}saving {formatCurrency(discountAmount)}
									</p>
								</div>
								<button onClick={clearDiscount}>
									<XIcon className="h-4 w-4 text-green-500 hover:text-green-700" />
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
										placeholder="e.g. SUMMER20"
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

					{/* Cashier info */}
					<div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-4 py-2.5">
						<BadgeCheckIcon className="h-4 w-4 text-green-600" />
						<span className="text-xs text-gray-500">Cashier:</span>
						<span className="text-xs font-semibold text-gray-800">
							{session?.user?.name ?? '—'}
						</span>
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
											'flex items-center gap-3 rounded-xl border p-3 text-left transition-all duration-150',
											isSelected
												? 'border-green-600 bg-green-50 text-green-700'
												: 'border-gray-100 bg-white text-gray-600 hover:border-gray-200 hover:bg-gray-50'
										)}
									>
										<div
											className={cn(
												'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
												isSelected ? 'bg-green-700' : 'bg-gray-100'
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
											<p className="mt-0.5 text-[10px] leading-tight text-gray-400">
												{m.desc}
											</p>
										</div>
										{isSelected && (
											<CheckCircleIcon className="ml-auto h-4 w-4 shrink-0 text-green-600" />
										)}
									</button>
								);
							})}
						</div>
					</div>

					{/* Customer phone lookup */}
					<div>
						<Label className="mb-2 block text-xs font-semibold tracking-wider text-gray-400 uppercase">
							Customer Phone
							<span className="ml-1 font-normal normal-case">(lookup member)</span>
						</Label>
						<div className="relative">
							<PhoneIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
							<Input
								value={phone}
								onChange={(e) => setPhone(e.target.value)}
								placeholder="e.g. 08123456789"
								className={cn(
									'h-9 pr-9 pl-9 text-sm shadow-none focus-visible:ring-0',
									isMember
										? 'border-green-500 bg-green-50 focus-visible:border-green-500'
										: 'border-gray-200 focus-visible:border-green-500'
								)}
							/>
							<div className="absolute top-1/2 right-3 -translate-y-1/2">
								{lookingUp && (
									<Loader2Icon className="h-4 w-4 animate-spin text-gray-400" />
								)}
								{!lookingUp && phone && (
									<button onClick={clearPhone}>
										<XIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
									</button>
								)}
								{!lookingUp && !phone && (
									<SearchIcon className="h-4 w-4 text-gray-300" />
								)}
							</div>
						</div>

						{/* Member found */}
						{isMember && foundCustomer && (
							<div className="mt-2 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
								<BadgeCheckIcon className="h-4 w-4 shrink-0 text-green-600" />
								<div className="min-w-0">
									<p className="text-xs font-semibold text-green-800">
										{foundCustomer.name}
									</p>
									<p className="text-[10px] text-green-600">
										{foundCustomer.phone}
										{foundCustomer.email ? ` · ${foundCustomer.email}` : ''}
									</p>
								</div>
								<span className="ml-auto rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
									Member
								</span>
							</div>
						)}

						{/* Not found — show name input */}
						{debouncedPhone.length >= 6 && !lookingUp && !foundCustomer && (
							<div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
								<p className="text-xs font-medium text-amber-700">
									No member found — enter customer name manually
								</p>
							</div>
						)}
					</div>

					{/* Customer name — manual if not member */}
					{!isMember && (
						<div>
							<Label className="mb-2 block text-xs font-semibold tracking-wider text-gray-400 uppercase">
								Customer Name
							</Label>
							<div className="relative">
								<UserIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
								<Input
									value={customerName}
									onChange={(e) => setCustomerName(e.target.value)}
									placeholder="Walk-in customer"
									className="h-9 border-gray-200 pl-9 text-sm shadow-none focus-visible:border-green-500 focus-visible:ring-0"
								/>
							</div>
						</div>
					)}

					{/* Note */}
					<div>
						<Label className="mb-2 block text-xs font-semibold tracking-wider text-gray-400 uppercase">
							Note <span className="font-normal normal-case">(optional)</span>
						</Label>
						<Input
							value={note}
							onChange={(e) => setNote(e.target.value)}
							placeholder="e.g. no spicy, extra sauce..."
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
						Cancel
					</Button>
					<Button
						className="flex-1 bg-green-600 font-semibold text-white hover:bg-green-700"
						onClick={handleConfirm}
						disabled={isPending}
					>
						{isPending ? (
							<>
								<Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
								Processing...
							</>
						) : (
							<>
								<CheckCircleIcon className="mr-2 h-4 w-4" />
								Confirm · {formatCurrency(finalTotal)}
							</>
						)}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default PaymentModal;
