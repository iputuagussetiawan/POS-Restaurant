'use client';

import Image from 'next/image';
import {
	MinusIcon,
	PlusIcon,
	ShoppingCartIcon,
	TrashIcon,
	CheckCircleIcon,
	Loader2Icon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useCurrency } from '@/modules/company/hooks/use-currency';
import { useCartStore } from '@/modules/pos/store/use-cart-store';

interface Props {
	taxRate: number;
	serviceRate: number;
	isPending: boolean;
	onCheckout: (totals: {
		subtotal: number;
		tax: number;
		serviceCharge: number;
		total: number;
	}) => void;
}

export const PosCart = ({ taxRate, serviceRate, isPending, onCheckout }: Props) => {
	const { format: formatCurrency } = useCurrency();
	const { items, removeItem, updateQuantity, clearCart } = useCartStore();

	const subtotal = items.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0);
	const tax = subtotal * taxRate;
	const serviceCharge = subtotal * serviceRate;
	const total = subtotal + tax + serviceCharge;
	const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);

	return (
		<div className="flex w-[320px] shrink-0 flex-col overflow-hidden rounded-2xl bg-gray-900 shadow-lg">
			{/* Header */}
			<div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4">
				<div className="flex items-center gap-2">
					<ShoppingCartIcon className="h-5 w-5 text-green-400" />
					<h3 className="text-base font-semibold text-white">Current Order</h3>
					{totalQty > 0 && (
						<Badge className="bg-green-600 px-2 py-0.5 text-xs text-white">
							{totalQty}
						</Badge>
					)}
				</div>
				{items.length > 0 && (
					<button
						onClick={clearCart}
						className="text-xs text-red-400 transition-colors hover:text-red-300"
					>
						Clear all
					</button>
				)}
			</div>

			{/* Items */}
			<ScrollArea className="min-h-0 flex-1">
				<div className="px-4 py-3">
					{items.length === 0 ? (
						<div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
							<ShoppingCartIcon className="h-10 w-10 text-white/20" />
							<p className="text-sm text-white/40">Cart is empty</p>
							<p className="text-xs text-white/25">Click a product to add it</p>
						</div>
					) : (
						<div className="flex flex-col gap-2">
							{items.map(({ product, quantity }) => (
								<div
									key={product.id}
									className="flex h-[72px] items-center gap-3 rounded-xl bg-white/8 px-3 transition-colors hover:bg-white/12"
								>
									<div className="relative h-[48px] w-[48px] shrink-0 overflow-hidden rounded-lg">
										<Image
											className="object-cover"
											src={product.imageUrl}
											alt={product.name}
											fill
											sizes="48px"
										/>
									</div>
									<div className="flex min-w-0 flex-1 flex-col gap-0.5">
										<p className="truncate text-xs leading-tight font-semibold text-white">
											{product.name}
										</p>
										<p className="text-xs font-bold text-green-400">
											{formatCurrency(Number(product.price))}
										</p>
										<div className="mt-1 flex items-center gap-1.5">
											<button
												onClick={() =>
													updateQuantity(product.id, quantity - 1)
												}
												className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
											>
												<MinusIcon className="h-2.5 w-2.5" />
											</button>
											<span className="w-4 text-center text-xs font-bold text-white">
												{quantity}
											</span>
											<button
												onClick={() =>
													updateQuantity(product.id, quantity + 1)
												}
												className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
											>
												<PlusIcon className="h-2.5 w-2.5" />
											</button>
											<span className="ml-auto text-xs text-white/40">
												{formatCurrency(Number(product.price) * quantity)}
											</span>
										</div>
									</div>
									<button
										onClick={() => removeItem(product.id)}
										className="shrink-0 text-white/30 transition-colors hover:text-red-400"
									>
										<TrashIcon className="h-3.5 w-3.5" />
									</button>
								</div>
							))}
						</div>
					)}
				</div>
			</ScrollArea>

			{/* Payment summary */}
			<div className="shrink-0 border-t border-white/10 bg-black/20 px-5 py-4">
				<h4 className="mb-3 text-xs font-semibold tracking-wider text-white/50 uppercase">
					Payment Summary
				</h4>
				<div className="space-y-2 text-sm">
					<div className="flex justify-between text-white/60">
						<span>Subtotal</span>
						<span>{formatCurrency(subtotal)}</span>
					</div>
					<div className="flex justify-between text-white/60">
						<span>Tax ({Math.round(taxRate * 100)}%)</span>
						<span>{formatCurrency(tax)}</span>
					</div>
					{serviceRate > 0 && (
						<div className="flex justify-between text-white/60">
							<span>Service ({Math.round(serviceRate * 100)}%)</span>
							<span>{formatCurrency(serviceCharge)}</span>
						</div>
					)}
				</div>
				<Separator className="my-3 bg-white/10" />
				<div className="flex justify-between text-base font-bold">
					<span className="text-white">Total</span>
					<span className="text-green-400">{formatCurrency(total)}</span>
				</div>
				<Button
					onClick={() => onCheckout({ subtotal, tax, serviceCharge, total })}
					disabled={items.length === 0 || isPending}
					className="mt-4 w-full bg-green-600 font-semibold text-white transition-colors hover:bg-green-500 disabled:opacity-60"
				>
					{isPending ? (
						<>
							<Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
							Placing Order...
						</>
					) : (
						<>
							<CheckCircleIcon className="mr-2 h-4 w-4" />
							Place Order · {formatCurrency(total)}
						</>
					)}
				</Button>
			</div>
		</div>
	);
};
