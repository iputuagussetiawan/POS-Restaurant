'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
	ShoppingBagIcon,
	MinusIcon,
	PlusIcon,
	TrashIcon,
	XIcon,
	ShoppingCartIcon,
	ArrowRightIcon,
} from 'lucide-react';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCartStore } from '@/modules/pos/store/use-cart-store';
import { useShopCurrency } from '../../hooks/use-shop-currency';
import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';

interface ShopCartSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export const ShopCartSheet = ({ open, onOpenChange }: ShopCartSheetProps) => {
	const trpc = useTRPC();
	const { format } = useShopCurrency();
	const { items, updateQuantity, clearCart } = useCartStore();

	const { data: settings } = useQuery(trpc.shop.getSettings.queryOptions());
	const taxRate = Number(settings?.taxRate ?? 0) / 100;
	const serviceRate = Number(settings?.serviceRate ?? 0) / 100;

	const subtotal = items.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0);
	const tax = subtotal * taxRate;
	const serviceCharge = subtotal * serviceRate;
	const total = subtotal + tax + serviceCharge;
	const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-sm">
				{/* Header */}
				<SheetHeader className="border-b px-5 py-4">
					<div className="flex items-center gap-2">
						<ShoppingBagIcon className="h-5 w-5 text-green-600" />
						<SheetTitle className="text-base">My Cart</SheetTitle>
						{totalQty > 0 && (
							<span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-green-100 px-1.5 text-xs font-bold text-green-700">
								{totalQty}
							</span>
						)}
						{items.length > 0 && (
							<button
								onClick={clearCart}
								className="ml-auto flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
							>
								<TrashIcon className="h-3.5 w-3.5" />
								Clear all
							</button>
						)}
					</div>
				</SheetHeader>

				{/* Empty state */}
				{items.length === 0 ? (
					<div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
						<div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
							<ShoppingCartIcon className="h-8 w-8 text-gray-300" />
						</div>
						<p className="font-semibold text-gray-700">Your cart is empty</p>
						<p className="text-sm text-gray-400">
							Browse our menu and add items to get started
						</p>
						<Button
							variant="outline"
							size="sm"
							className="mt-2"
							onClick={() => onOpenChange(false)}
						>
							<XIcon className="mr-1.5 h-3.5 w-3.5" />
							Continue browsing
						</Button>
					</div>
				) : (
					<>
						<ScrollArea className="min-h-0 flex-1">
							<div className="flex flex-col divide-y divide-gray-50 px-3 py-2">
								{items.map(({ product, quantity }) => (
									<div key={product.id} className="flex gap-3 py-3">
										{/* Image */}
										<div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-gray-100">
											<Image
												src={product.imageUrl}
												alt={product.name}
												fill
												sizes="64px"
												className="object-cover"
											/>
										</div>

										{/* Info + controls */}
										<div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
											<p className="line-clamp-2 text-sm leading-snug font-semibold text-gray-800">
												{product.name}
											</p>

											<div className="flex items-center justify-between gap-2">
												<div className="min-w-0">
													<p className="text-xs font-bold text-green-600">
														{format(Number(product.price) * quantity)}
													</p>
													<p className="text-[10px] text-gray-400">
														{format(Number(product.price))} each
													</p>
												</div>

												{/* Qty controls */}
												<div className="flex shrink-0 items-center gap-1">
													<button
														onClick={() =>
															updateQuantity(product.id, quantity - 1)
														}
														className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-500"
													>
														<MinusIcon className="h-3 w-3" />
													</button>
													<span className="w-6 text-center text-sm font-bold text-gray-800">
														{quantity}
													</span>
													<button
														onClick={() =>
															updateQuantity(product.id, quantity + 1)
														}
														className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-600 text-white transition-colors hover:bg-green-700"
													>
														<PlusIcon className="h-3 w-3" />
													</button>
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
						</ScrollArea>

						{/* Summary + CTA */}
						<div className="shrink-0 border-t bg-gray-50/80 px-5 py-4">
							<div className="space-y-2 text-sm">
								<div className="flex justify-between text-gray-500">
									<span>Subtotal</span>
									<span>{format(subtotal)}</span>
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
								<Separator />
								<div className="flex justify-between text-base font-bold text-gray-900">
									<span>Total</span>
									<span className="text-green-700">{format(total)}</span>
								</div>
							</div>

							<Button
								asChild
								className="mt-4 w-full bg-green-600 font-semibold text-white hover:bg-green-700"
								onClick={() => onOpenChange(false)}
							>
								<Link href="/shop/checkout">
									Proceed to checkout
									<ArrowRightIcon className="ml-2 h-4 w-4" />
								</Link>
							</Button>
						</div>
					</>
				)}
			</SheetContent>
		</Sheet>
	);
};
