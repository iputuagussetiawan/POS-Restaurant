import Image from 'next/image';
import React from 'react';

const CardProduct = () => {
	return (
		<div className="group relative flex cursor-pointer flex-col items-center justify-center rounded-4xl border-1  bg-white shadow-2xl py-8 px-8 transition-all hover:border-orange-400 hover:bg-orange-400 hover:text-white">
			<Image
				src="/images/Pizza-3007395.jpg"
				alt="category"
				width={300}
				height={300}
				quality={100}
				className="h-[180px] w-[180px] rounded-full object-cover relative"
			/>
			<h3 className="mt-2 text-center text-base font-semibold">Pizza Meat Lover</h3>

			<div className='flex w-full justify-between p-2  border-b border-t mt-2 border-orange-400 group-hover:border-white gap-4 transition-all'>
				<span>
					60 calories
				</span>
				<span>
					4 person
				</span>
			</div>
			<div className='flex w-full justify-between mt-4'>
				<span className='font-semibold text-2xl'>Rp200K</span>
			</div>
		</div>
	);
};

export default CardProduct;
