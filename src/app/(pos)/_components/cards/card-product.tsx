import { formatNumberShort } from '@/lib/format-number-sort';
import { POSGetOne } from '@/modules/pos/types';
import Image from 'next/image';
import React from 'react';

interface CardProductProps {
	data?: POSGetOne;
}

const CardProduct = ({ data }: CardProductProps) => {
	const printPrice = data?.price ? formatNumberShort(Number(data.price)) : '';

	return (
		<div className="group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border bg-white px-4 py-4 text-gray-600 shadow-2xl transition-all hover:border-green-700 hover:bg-green-700 hover:text-white">
			<Image
				src={data?.imageUrl as string}
				alt="category"
				width={300}
				height={300}
				quality={100}
				className="relative h-36 w-36 rounded-full object-cover"
			/>
			<h3 className="mt-2 text-center text-base font-semibold">{data?.name}</h3>
			<div className="mt-2 flex w-full justify-between gap-4 border-t border-b border-green-700 p-2 text-xs transition-all group-hover:border-white">
				<span>60 calories</span>
				<span>4 person</span>
			</div>
			<div className="mt-4 flex w-full justify-between">
				<div>
					<span className="text-xl font-semibold">{printPrice}</span>
					<span className="text-xs"> IDR</span>
				</div>
			</div>
		</div>
	);
};

export default CardProduct;
