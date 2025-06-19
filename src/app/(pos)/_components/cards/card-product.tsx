import { formatNumberShort } from '@/lib/format-number-sort';
import { POSGetOne } from '@/modules/pos/types';
import { useTRPC } from '@/trpc/client';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import React from 'react';

interface CardProductProps {
	data?: POSGetOne;
}

const CardProduct = ({data}:CardProductProps) => {
	const trpc = useTRPC();
	const { data: dataItems } = useQuery(
		trpc.products.getProductItems.queryOptions({id: data?.id as string})
	);

	const dataItemsList = dataItems?.data ?? [];
	const totalDataItems=dataItemsList.length
	const prices = dataItemsList.map(item => item.price);
	
	
	let printPrice: string = '';

if (totalDataItems > 2) {
	const minPrice = Math.min(...prices);
	const maxPrice = Math.max(...prices);
	printPrice = `${formatNumberShort(minPrice)} - ${formatNumberShort(maxPrice)}`;
} else {
	const singlePrice = formatNumberShort(dataItemsList[0]?.price);
	printPrice = singlePrice !== undefined ? `${singlePrice}` : '';
}

	return (
		<div className="group relative text-gray-600 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-1  bg-white shadow-2xl py-4 px-4 transition-all hover:border-green-700 hover:bg-green-700 hover:text-white">
			<Image
				src={data?.imageUrl as string}
				alt="category"
				width={300}
				height={300}
				quality={100}
				className="h-[150px] w-[150px] rounded-full object-cover relative"
			/>

			<h3 className="mt-2 text-center text-base font-semibold">{data?.name}</h3>
			<div className='text-xs flex w-full justify-between p-2  border-b border-t mt-2 border-green-700 group-hover:border-white gap-4 transition-all'>
				<span>
					60 calories
				</span>
				<span>
					4 person
				</span>
			</div>
			<div className='flex w-full justify-between mt-4'>
				<div>
					<span className='font-semibold text-xl '>
						
						{printPrice}
					</span>
					<span className='text-xs'> IDR</span>
				</div>
			</div>
		</div>
	);
};

export default CardProduct;
