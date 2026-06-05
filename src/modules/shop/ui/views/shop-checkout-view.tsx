'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useTRPC } from '@/trpc/client';
import { useCartStore } from '@/modules/pos/store/use-cart-store';
import { useShopCurrency } from '../../hooks/use-shop-currency';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
	BanknoteIcon,
	CreditCardIcon,
	QrCodeIcon,
	ArrowRightLeftIcon,
	UserIcon,
	StickyNoteIcon,
	TicketPercentIcon,
	XIcon,
	Loader2Icon,
	CheckIcon,
	ChevronLeftIcon,
	ShoppingBagIcon,
	UtensilsCrossed,
	ArrowRightIcon,
	LogInIcon,
	LockIcon,
	MailIcon,
	UserCircle2Icon,
} from 'lucide-react';

type PaymentMethod = 'cash' | 'card' | 'qris' | 'transfer';

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

const SectionCard = ({
	title,
	badge,
	children,
}: {
	title: string;
	badge?: React.ReactNode;
	children: React.ReactNode;
}) => (
	<div className="rounded-2xl border border-gray-100 bg-white p-5">
		<div className="mb-4 flex items-center justify-between">
			<h2 className="text-sm font-bold text-gray-800">{title}</h2>
			{badge}
		</div>
		{children}
	</div>
);

/* ── Login gate shown when user is not authenticated ── */
const LoginGate = () => (
	<div className="min-h-screen bg-gray-50">
		{/* Minimal header */}
		<nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md">
			<div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4 md:px-6">
				<Link href="/" className="group flex shrink-0 items-center gap-2">
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-700 transition-transform duration-200 group-hover:scale-105">
						<UtensilsCrossed className="h-4 w-4 text-white" />
					</div>
					<span className="hidden text-base font-bold tracking-tight text-gray-900 sm:block">
						Food<span className="text-green-700">Order</span>
					</span>
				</Link>
			</div>
		</nav>

		<div className="mx-auto flex max-w-md flex-col items-center px-4 pt-20 pb-10 text-center">
			{/* Lock illustration */}
			<div className="relative mb-6">
				<div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
					<LockIcon className="h-9 w-9 text-green-600" />
				</div>
				<div className="absolute -right-1 -bottom-1 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md">
					<UserCircle2Icon className="h-5 w-5 text-gray-400" />
				</div>
			</div>

			<h1 className="mb-2 text-xl font-bold text-gray-900">Sign in to checkout</h1>
			<p className="mb-1 text-sm text-gray-500">
				You need to be logged in as a member to complete your order.
			</p>
			<p className="mb-8 text-sm text-gray-400">
				Your cart will be saved — just sign in and come back.
			</p>

			{/* CTA */}
			<div className="flex w-full flex-col gap-3">
				<Button
					asChild
					className="h-11 w-full rounded-xl bg-green-600 text-sm font-bold text-white hover:bg-green-700"
				>
					<Link href={`/sign-in?callbackUrl=${encodeURIComponent('/shop/checkout')}`}>
						<LogInIcon className="mr-2 h-4 w-4" />
						Sign in to continue
					</Link>
				</Button>
				<Button
					asChild
					variant="outline"
					className="h-11 w-full rounded-xl border-gray-200"
				>
					<Link href="/shop">
						<ChevronLeftIcon className="mr-1.5 h-4 w-4" />
						Back to menu
					</Link>
				</Button>
			</div>

			{/* Info */}
			<div className="mt-8 w-full rounded-2xl border border-gray-100 bg-white p-4 text-left">
				<p className="mb-3 text-[11px] font-bold tracking-wider text-gray-400 uppercase">
					Why sign in?
				</p>
				<div className="flex flex-col gap-2.5">
					{[
						{ icon: UserIcon, text: 'Your name is linked to the order automatically' },
						{ icon: MailIcon, text: 'Track your order history from your account' },
						{ icon: TicketPercentIcon, text: 'Access exclusive member discounts' },
					].map(({ icon: Icon, text }) => (
						<div key={text} className="flex items-start gap-2.5">
							<div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-green-50">
								<Icon className="h-3 w-3 text-green-600" />
							</div>
							<p className="text-xs text-gray-600">{text}</p>
						</div>
					))}
				</div>
			</div>
		</div>
	</div>
);

export const ShopCheckoutView = () => {
	const router = useRouter();
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { format } = useShopCurrency();
	const { items, clearCart } = useCartStore();

	const { data: session, isPending: sessionLoading } = authClient.useSession();

	const { data: settings } = useQuery(trpc.shop.getSettings.queryOptions());
	const taxRate = Number(settings?.taxRate ?? 0) / 100;
	const serviceRate = Number(settings?.serviceRate ?? 0) / 100;

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

	/* Pre-fill name from session once loaded */
	useEffect(() => {
		if (session?.user?.name && !customerName) {
			setCustomerName(session.user.name);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [session]);

	const subtotal = items.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0);
	const tax = subtotal * taxRate;
	const serviceCharge = subtotal * serviceRate;
	const total = subtotal + tax + serviceCharge;
	const discountAmount = appliedDiscount?.discountAmount ?? 0;
	const finalTotal = Math.max(0, total - discountAmount);
	const totalQty = items.reduce((s, i) => s + i.quantity, 0);

	const placeOrder = useMutation(
		trpc.orders.place.mutationOptions({
			onSuccess: () => {
				clearCart();
				queryClient.invalidateQueries({ queryKey: trpc.orders.getMany.queryKey() });
				toast.success('Order placed successfully!');
				router.push('/shop');
			},
			onError: (e: { message: string }) => toast.error(e.message),
		})
	);

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

	const handlePlaceOrder = () => {
		placeOrder.mutate({
			items: items.map(({ product, quantity }) => ({
				productId: product.id,
				name: product.name,
				price: Number(product.price),
				quantity,
			})),
			paymentMethod: method,
			customerName: customerName || session?.user?.name || undefined,
			note: note || undefined,
			discountCode: appliedDiscount?.code || undefined,
		});
	};

	/* Loading — wait for session check */
	if (sessionLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader2Icon className="h-8 w-8 animate-spin text-green-600" />
			</div>
		);
	}

	/* Not logged in → show login gate */
	if (!session) {
		return <LoginGate />;
	}

	/* Empty cart */
	if (items.length === 0) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
				<div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
					<ShoppingBagIcon className="h-8 w-8 text-gray-300" />
				</div>
				<p className="font-bold text-gray-800">Your cart is empty</p>
				<p className="text-sm text-gray-400">Add items before checking out</p>
				<Button asChild className="mt-2 bg-green-600 hover:bg-green-700">
					<Link href="/shop">Browse menu</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<nav className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur-md">
				<div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4 md:px-6">
					<Link href="/" className="group flex shrink-0 items-center gap-2">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-700 transition-transform duration-200 group-hover:scale-105">
							<UtensilsCrossed className="h-4 w-4 text-white" />
						</div>
						<span className="hidden text-base font-bold tracking-tight text-gray-900 sm:block">
							Food<span className="text-green-700">Order</span>
						</span>
					</Link>

					<div className="flex flex-1 items-center justify-center">
						<div className="flex items-center gap-2 text-sm text-gray-500">
							<Link
								href="/shop"
								className="text-gray-400 transition-colors hover:text-green-600"
							>
								Menu
							</Link>
							<ArrowRightIcon className="h-3 w-3 text-gray-200" />
							<span className="text-gray-400">Cart</span>
							<ArrowRightIcon className="h-3 w-3 text-gray-200" />
							<span className="font-semibold text-gray-800">Checkout</span>
						</div>
					</div>

					{/* Logged-in user chip */}
					<div className="flex shrink-0 items-center gap-2 rounded-xl border border-gray-100 bg-white px-3 py-1.5">
						{session.user.image ? (
							<Image
								src={session.user.image}
								alt={session.user.name}
								width={20}
								height={20}
								className="h-5 w-5 rounded-full object-cover"
							/>
						) : (
							<div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
								<UserIcon className="h-3 w-3 text-green-600" />
							</div>
						)}
						<span className="hidden max-w-[100px] truncate text-xs font-semibold text-gray-700 sm:block">
							{session.user.name}
						</span>
					</div>
				</div>
			</nav>

			<div className="mx-auto max-w-5xl px-4 py-6 md:px-6 md:py-8">
				<div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
					{/* ── Left column ── */}
					<div className="flex flex-1 flex-col gap-4">
						{/* Member banner */}
						<div className="flex items-center gap-3 rounded-2xl border border-green-100 bg-green-50 px-4 py-3">
							<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100">
								{session.user.image ? (
									<Image
										src={session.user.image}
										alt={session.user.name}
										width={36}
										height={36}
										className="h-9 w-9 rounded-full object-cover"
									/>
								) : (
									<UserCircle2Icon className="h-5 w-5 text-green-600" />
								)}
							</div>
							<div className="min-w-0 flex-1">
								<p className="text-xs font-bold text-green-800">
									Ordering as {session.user.name}
								</p>
								<p className="truncate text-[11px] text-green-600">
									{session.user.email}
								</p>
							</div>
							<div className="flex h-6 items-center rounded-full bg-green-600 px-2.5">
								<span className="text-[10px] font-bold tracking-wide text-white uppercase">
									Member
								</span>
							</div>
						</div>

						{/* Payment method */}
						<SectionCard title="Payment Method">
							<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
								{PAYMENT_METHODS.map((m) => {
									const Icon = m.icon;
									const isSelected = method === m.value;
									return (
										<button
											key={m.value}
											onClick={() => setMethod(m.value)}
											className={cn(
												'relative flex flex-col items-center gap-2 rounded-xl border p-3.5 text-center transition-all',
												isSelected
													? 'border-green-500 bg-green-50'
													: 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
											)}
										>
											<div
												className={cn(
													'flex h-10 w-10 items-center justify-center rounded-xl',
													isSelected ? 'bg-green-600' : m.bg
												)}
											>
												<Icon
													className={cn(
														'h-5 w-5',
														isSelected ? 'text-white' : m.color
													)}
												/>
											</div>
											<div>
												<p
													className={cn(
														'text-xs font-bold',
														isSelected
															? 'text-green-800'
															: 'text-gray-700'
													)}
												>
													{m.label}
												</p>
												<p className="text-[10px] text-gray-400">
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
						</SectionCard>

						{/* Promo code */}
						<SectionCard
							title="Promo Code"
							badge={<span className="text-[11px] text-gray-400">optional</span>}
						>
							{appliedDiscount ? (
								<div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
									<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100">
										<TicketPercentIcon className="h-4 w-4 text-green-600" />
									</div>
									<div className="min-w-0 flex-1">
										<p className="text-sm font-bold text-green-800">
											{appliedDiscount.code}
										</p>
										<p className="text-xs text-green-600">
											{appliedDiscount.type === 'percentage'
												? `${appliedDiscount.value}% off`
												: `${format(appliedDiscount.value)} off`}
											{' · '}saving {format(discountAmount)}
										</p>
									</div>
									<button
										onClick={clearDiscount}
										className="rounded-lg p-1.5 text-green-400 transition-colors hover:bg-green-100 hover:text-green-700"
									>
										<XIcon className="h-4 w-4" />
									</button>
								</div>
							) : (
								<>
									<div className="flex gap-2">
										<div className="relative flex-1">
											<TicketPercentIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-300" />
											<Input
												value={discountInput}
												onChange={(e) =>
													setDiscountInput(
														e.target.value
															.toUpperCase()
															.replace(/\s/g, '')
													)
												}
												onKeyDown={(e) =>
													e.key === 'Enter' && applyDiscount()
												}
												placeholder="Enter promo code"
												className="h-10 border-gray-200 pl-10 font-mono uppercase shadow-none focus-visible:border-green-500 focus-visible:ring-0"
											/>
										</div>
										<Button
											type="button"
											variant="outline"
											className="h-10 shrink-0 border-gray-200 px-5 font-semibold"
											onClick={applyDiscount}
											disabled={!discountInput.trim() || discountChecking}
										>
											{discountChecking ? (
												<Loader2Icon className="h-4 w-4 animate-spin" />
											) : (
												'Apply'
											)}
										</Button>
									</div>
									{discountError && (
										<p className="mt-2 flex items-center gap-1 text-xs text-red-500">
											<XIcon className="h-3 w-3 shrink-0" />
											{discountError}
										</p>
									)}
								</>
							)}
						</SectionCard>

						{/* Order note */}
						<SectionCard
							title="Order Note"
							badge={<span className="text-[11px] text-gray-400">optional</span>}
						>
							<div className="relative">
								<StickyNoteIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-300" />
								<Input
									value={note}
									onChange={(e) => setNote(e.target.value)}
									placeholder="e.g. no spicy, extra sauce, allergy info…"
									className="h-10 border-gray-200 pl-10 shadow-none focus-visible:border-green-500 focus-visible:ring-0"
								/>
							</div>
						</SectionCard>
					</div>

					{/* ── Right column — sticky order summary ── */}
					<div className="w-full lg:w-80 xl:w-96">
						<div className="sticky top-20 flex flex-col gap-4">
							<div className="rounded-2xl border border-gray-100 bg-white p-5">
								<h2 className="mb-4 text-sm font-bold text-gray-800">
									Order Summary
									<span className="ml-2 text-xs font-normal text-gray-400">
										({totalQty} item{totalQty !== 1 ? 's' : ''})
									</span>
								</h2>

								{/* Items */}
								<div className="mb-4 flex max-h-52 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent flex-col gap-3 overflow-y-auto pr-1">
									{items.map(({ product, quantity }) => (
										<div key={product.id} className="flex items-center gap-3">
											<div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-gray-100">
												<Image
													src={product.imageUrl}
													alt={product.name}
													fill
													sizes="48px"
													className="object-cover"
												/>
											</div>
											<div className="min-w-0 flex-1">
												<p className="line-clamp-1 text-xs font-semibold text-gray-800">
													{product.name}
												</p>
												<p className="text-[11px] text-gray-400">
													{format(Number(product.price))} × {quantity}
												</p>
											</div>
											<p className="shrink-0 text-xs font-bold text-gray-800">
												{format(Number(product.price) * quantity)}
											</p>
										</div>
									))}
								</div>

								<Separator className="mb-4" />

								{/* Totals */}
								<div className="space-y-2 text-sm">
									<div className="flex justify-between text-gray-500">
										<span>Subtotal</span>
										<span className="font-medium text-gray-700">
											{format(subtotal)}
										</span>
									</div>
									{taxRate > 0 && (
										<div className="flex justify-between text-gray-500">
											<span>Tax ({Math.round(taxRate * 100)}%)</span>
											<span>{format(tax)}</span>
										</div>
									)}
									{serviceRate > 0 && (
										<div className="flex justify-between text-gray-500">
											<span>Service ({Math.round(serviceRate * 100)}%)</span>
											<span>{format(serviceCharge)}</span>
										</div>
									)}
									{appliedDiscount && (
										<div className="flex justify-between font-semibold text-green-600">
											<span className="flex items-center gap-1">
												<TicketPercentIcon className="h-3.5 w-3.5" />
												{appliedDiscount.code}
											</span>
											<span>-{format(discountAmount)}</span>
										</div>
									)}
									<Separator />
									<div className="flex justify-between text-base font-bold">
										<span className="text-gray-900">Total</span>
										<span className="text-green-700">{format(finalTotal)}</span>
									</div>
								</div>

								{appliedDiscount && (
									<div className="mt-3 rounded-xl bg-green-50 px-3 py-2 text-center">
										<p className="text-xs font-semibold text-green-700">
											You save {format(discountAmount)} with this promo!
										</p>
									</div>
								)}

								<Button
									className="mt-4 h-11 w-full rounded-xl bg-green-600 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-60"
									onClick={handlePlaceOrder}
									disabled={placeOrder.isPending}
								>
									{placeOrder.isPending ? (
										<>
											<Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
											Placing order…
										</>
									) : (
										<>
											Place Order
											<ArrowRightIcon className="ml-2 h-4 w-4" />
										</>
									)}
								</Button>

								<p className="mt-3 text-center text-[11px] text-gray-400">
									By placing your order you agree to our terms of service
								</p>
							</div>

							<Button
								variant="ghost"
								className="w-full text-sm text-gray-500"
								onClick={() => router.back()}
							>
								<ChevronLeftIcon className="mr-1.5 h-4 w-4" />
								Back to cart
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
