import { POSGetOne } from '@/modules/pos/types';
import Image from 'next/image';
import React from 'react';

interface CardProductProps {
	data?: POSGetOne;
}

const CardProduct = ({data}:CardProductProps) => {
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
				<span className='font-semibold text-xl '>Rp200K</span>
			</div>
		</div>
	);
};

export default CardProduct;
