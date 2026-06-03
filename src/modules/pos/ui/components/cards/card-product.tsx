'use client';
import { POSGetOne } from '@/modules/pos/types';
import { useCartStore } from '@/modules/pos/store/use-cart-store';
import Image from 'next/image';
import React from 'react';
import { PlusIcon } from 'lucide-react';

interface CardProductProps {
	data?: POSGetOne;
}

function formatIDR(amount: number) {
	return new Intl.NumberFormat('id-ID', {
		style: 'currency',
		currency: 'IDR',
		minimumFractionDigits: 0,
	}).format(amount);
}

const CardProduct = ({ data }: CardProductProps) => {
	const addItem = useCartStore((s) => s.addItem);
	const cartItems = useCartStore((s) => s.items);
	const qty = cartItems.find((i) => i.product.id === data?.id)?.quantity ?? 0;

	if (!data) return null;

	return (
		<div
			onClick={() => addItem(data)}
			className="group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border bg-white px-4 py-4 text-gray-600 shadow-2xl transition-all hover:border-green-700 hover:bg-green-700 hover:text-white"
		>
			{qty > 0 && (
				<span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white group-hover:bg-white group-hover:text-green-700">
					{qty}
				</span>
			)}
			<Image
				src={data.imageUrl}
				alt={data.name}
				width={300}
				height={300}
				quality={100}
				className="relative h-36 w-36 rounded-full object-cover"
			/>
			<h3 className="mt-2 text-center text-base font-semibold">{data.name}</h3>
			<div className="mt-2 flex w-full justify-between gap-4 border-t border-b border-green-700 p-2 text-xs transition-all group-hover:border-white">
				<span>Click to add</span>
				<PlusIcon className="h-3 w-3" />
			</div>
			<div className="mt-4 flex w-full justify-between">
				<div>
					<span className="text-xl font-semibold">{formatIDR(Number(data.price))}</span>
				</div>
			</div>
		</div>
	);
};

export default CardProduct;
