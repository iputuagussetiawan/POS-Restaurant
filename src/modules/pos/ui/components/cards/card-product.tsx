'use client';
import { POSGetOne } from '@/modules/pos/types';
import { useCartStore } from '@/modules/pos/store/use-cart-store';
import Image from 'next/image';
import React from 'react';
import { PlusIcon, MinusIcon, ShoppingCartIcon } from 'lucide-react';

interface CardProductProps {
	data?: POSGetOne;
}

function formatUSD(amount: number) {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 2,
	}).format(amount);
}

const CardProduct = ({ data }: CardProductProps) => {
	const addItem = useCartStore((s) => s.addItem);
	const updateQuantity = useCartStore((s) => s.updateQuantity);
	const cartItem = useCartStore((s) => s.items.find((i) => i.product.id === data?.id));
	const qty = cartItem?.quantity ?? 0;

	if (!data) return null;

	return (
		<div className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.07)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(0,0,0,0.13)]">
			{/* Image */}
			<div className="relative h-36 w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
				<Image
					src={data.imageUrl}
					alt={data.name}
					fill
					sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
					quality={90}
					className="object-cover transition-transform duration-500 group-hover:scale-110"
				/>
				{/* dark overlay on hover */}
				<div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/10" />

				{/* qty badge */}
				{qty > 0 && (
					<div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-green-600 py-0.5 pr-2 pl-1.5 shadow-md ring-2 ring-white">
						<ShoppingCartIcon className="h-2.5 w-2.5 text-white" />
						<span className="text-[10px] leading-none font-bold text-white">{qty}</span>
					</div>
				)}

				{/* category chip */}
				<span className="absolute bottom-2 left-2 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-medium text-white capitalize backdrop-blur-sm">
					{data.categories?.name ?? 'Food'}
				</span>
			</div>

			{/* Info */}
			<div className="flex flex-1 flex-col px-3 pt-2.5 pb-3">
				<h3 className="line-clamp-2 text-xs leading-snug font-semibold text-gray-800 transition-colors duration-200 group-hover:text-green-700">
					{data.name}
				</h3>
				<p className="mt-1.5 text-sm font-bold text-green-700">
					{formatUSD(Number(data.price))}
				</p>
			</div>

			{/* Cart controls */}
			<div className="px-3 pb-3">
				{qty === 0 ? (
					<button
						onClick={() => addItem(data)}
						className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-green-600 py-1.5 text-xs font-semibold text-white transition-all duration-200 hover:bg-green-700 active:scale-95"
					>
						<ShoppingCartIcon className="h-3.5 w-3.5" />
						Add to order
					</button>
				) : (
					<div className="flex items-center justify-between rounded-xl bg-green-600 p-0.5">
						<button
							onClick={() => updateQuantity(data.id, qty - 1)}
							className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 text-white backdrop-blur-sm transition-all hover:bg-white/30 active:scale-90"
						>
							<MinusIcon className="h-3 w-3" />
						</button>
						<div className="flex items-center gap-1.5">
							<ShoppingCartIcon className="h-3 w-3 text-white/80" />
							<span className="min-w-[1rem] text-center text-xs font-bold text-white">
								{qty}
							</span>
						</div>
						<button
							onClick={() => addItem(data)}
							className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 text-white backdrop-blur-sm transition-all hover:bg-white/30 active:scale-90"
						>
							<PlusIcon className="h-3 w-3" />
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default CardProduct;
