import { Skeleton } from '@/components/ui/skeleton';
import { formatNumberShort } from '@/lib/format-number-sort';
import { POSGetOne } from '@/modules/pos/types';
import { useTRPC } from '@/trpc/client';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import React from 'react';

interface CardProductProps {
	data?: POSGetOne;
}

const CardProduct = ({ data }: CardProductProps) => {
	const trpc = useTRPC();
	const { data: dataItems, isLoading } = useQuery(
		trpc.products.getProductItems.queryOptions({ id: data?.id as string })
	);

	const dataItemsList = dataItems?.data ?? [];
	const totalDataItems = dataItemsList.length;
	const prices = dataItemsList.map((item) => item.price);

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
		<div className="group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-1 bg-white px-4 py-4 text-gray-600 shadow-2xl transition-all hover:border-green-700 hover:bg-green-700 hover:text-white">
			<Image
				src={data?.imageUrl as string}
				alt="category"
				width={300}
				height={300}
				quality={100}
				className="relative h-[150px] w-[150px] rounded-full object-cover"
			/>

			<h3 className="mt-2 text-center text-base font-semibold">{data?.name}</h3>
			<div className="mt-2 flex w-full justify-between gap-4 border-t border-b border-green-700 p-2 text-xs transition-all group-hover:border-white">
				<span>60 calories</span>
				<span>4 person</span>
			</div>
			<div className="mt-4 flex w-full justify-between">
				<div>
					{isLoading && (
						<Skeleton className="h-full w-[100px] rounded-full px-3 py-1 text-sm font-semibold">
							&nbsp;
						</Skeleton>
					)}

					{!isLoading && (
						<div>
							<span className="text-xl font-semibold">{printPrice}</span>
							<span className="text-xs"> IDR</span>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default CardProduct;
