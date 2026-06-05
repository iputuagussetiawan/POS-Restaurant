'use client';

import Image from 'next/image';
import { MinusIcon, PlusIcon, ShoppingBagIcon } from 'lucide-react';
import { useCartStore } from '@/modules/pos/store/use-cart-store';
import { useShopCurrency } from '../../hooks/use-shop-currency';
import type { ShopProduct } from '../../types';
import { cn } from '@/lib/utils';

interface ShopCardProductProps {
	data: ShopProduct;
	taxRate: number;
	serviceRate: number;
}

const ShopCardProduct = ({ data, taxRate, serviceRate }: ShopCardProductProps) => {
	const { format } = useShopCurrency();
	const addItem = useCartStore((s) => s.addItem);
	const updateQuantity = useCartStore((s) => s.updateQuantity);
	const cartItem = useCartStore((s) => s.items.find((i) => i.product.id === data.id));
	const qty = cartItem?.quantity ?? 0;

	const basePrice = Number(data.price);
	const finalPrice = basePrice * (1 + taxRate + serviceRate);

	return (
		<div className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
			{/* Image */}
			<div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
				<Image
					src={data.imageUrl}
					alt={data.name}
					fill
					sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
					className="object-cover transition-transform duration-300 group-hover:scale-105"
				/>

				{/* Category chip */}
				<span className="absolute top-2 left-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-gray-600 shadow-sm backdrop-blur-sm">
					{data.categories?.name}
				</span>

				{/* In-cart badge */}
				{qty > 0 && (
					<div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-[11px] font-bold text-white shadow-md ring-2 ring-white">
						{qty}
					</div>
				)}
			</div>

			{/* Body */}
			<div className="flex flex-1 flex-col gap-3 p-3">
				<div className="flex-1">
					<h3 className="line-clamp-2 text-sm leading-snug font-semibold text-gray-800">
						{data.name}
					</h3>
					<p className="mt-1 text-base font-bold text-green-700">{format(finalPrice)}</p>
					{(taxRate > 0 || serviceRate > 0) && (
						<p className="mt-0.5 text-[11px] text-gray-400">{format(basePrice)} base</p>
					)}
				</div>

				{/* Cart control */}
				{qty === 0 ? (
					<button
						onClick={() => addItem(data)}
						className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-green-600 py-2 text-xs font-semibold text-white transition-colors hover:bg-green-700 active:scale-95"
					>
						<ShoppingBagIcon className="h-3.5 w-3.5" />
						Add to cart
					</button>
				) : (
					<div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-1 py-1">
						<button
							onClick={() => updateQuantity(data.id, qty - 1)}
							className={cn(
								'flex h-7 w-7 items-center justify-center rounded-lg transition-colors',
								'bg-white text-gray-600 shadow-sm hover:bg-red-50 hover:text-red-600'
							)}
						>
							<MinusIcon className="h-3.5 w-3.5" />
						</button>
						<span className="min-w-[2rem] text-center text-sm font-bold text-green-700">
							{qty}
						</span>
						<button
							onClick={() => addItem(data)}
							className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-600 text-white shadow-sm transition-colors hover:bg-green-700"
						>
							<PlusIcon className="h-3.5 w-3.5" />
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default ShopCardProduct;
