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
	const removeItem = useCartStore((s) => s.removeItem);
	const updateQuantity = useCartStore((s) => s.updateQuantity);
	const cartItem = useCartStore((s) => s.items.find((i) => i.product.id === data?.id));
	const qty = cartItem?.quantity ?? 0;

	if (!data) return null;

	return (
		<div className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-green-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
			{/* Image area */}
			<div className="relative flex h-40 items-center justify-center bg-gray-50 p-4">
				<Image
					src={data.imageUrl}
					alt={data.name}
					width={200}
					height={200}
					quality={90}
					className="h-32 w-32 rounded-full object-cover transition-transform duration-300 group-hover:scale-105"
				/>
				{/* qty badge */}
				{qty > 0 && (
					<span className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white shadow">
						{qty}
					</span>
				)}
				{/* availability dot */}
				<span className="absolute top-3 left-3 flex h-2 w-2 rounded-full bg-green-500" />
			</div>

			{/* Info */}
			<div className="flex flex-1 flex-col gap-1 px-3 pt-2 pb-3">
				<h3 className="line-clamp-2 text-sm leading-tight font-semibold text-gray-800">
					{data.name}
				</h3>
				<p className="text-xs text-gray-400 capitalize">
					{data.categories?.name ?? 'Uncategorized'}
				</p>
				<p className="mt-auto pt-2 text-sm font-bold text-green-700">
					{formatUSD(Number(data.price))}
				</p>
			</div>

			{/* Cart controls */}
			<div className="px-3 pb-3">
				{qty === 0 ? (
					<button
						onClick={() => addItem(data)}
						className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-green-600 py-2 text-xs font-semibold text-white transition-all hover:bg-green-700 active:scale-95"
					>
						<ShoppingCartIcon className="h-3.5 w-3.5" />
						Add to order
					</button>
				) : (
					<div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-2 py-1">
						<button
							onClick={() => updateQuantity(data.id, qty - 1)}
							className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-green-700 shadow-sm transition-colors hover:bg-green-100 active:scale-95"
						>
							<MinusIcon className="h-3.5 w-3.5" />
						</button>
						<span className="min-w-[1.5rem] text-center text-sm font-bold text-green-800">
							{qty}
						</span>
						<button
							onClick={() => addItem(data)}
							className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-600 text-white shadow-sm transition-colors hover:bg-green-700 active:scale-95"
						>
							<PlusIcon className="h-3.5 w-3.5" />
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default CardProduct;
