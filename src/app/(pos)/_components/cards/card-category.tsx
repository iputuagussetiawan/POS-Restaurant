import Image from 'next/image';
import React from 'react';

const CardCategory = () => {
	return (
		<div className="flex cursor-pointer flex-col items-center justify-center rounded-4xl border-1 border-green-500 bg-green-100 p-4 transition-all hover:border-green-700 hover:bg-green-700 hover:text-white">
			<Image
				src="/images/Pizza-3007395.jpg"
				alt="category"
				width={300}
				height={300}
				quality={100}
				className="h-[100px] w-[100px] rounded-full object-cover"
			/>
			<h3 className="mt-2 text-center text-base font-semibold">Main Course</h3>
		</div>
	);
};

export default CardCategory;
