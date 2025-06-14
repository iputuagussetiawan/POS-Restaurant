import Image from 'next/image';
import React from 'react';

interface CardCategoryProps {
	category: {
    	name: string;
		imageUrl: string
	};
}

const CardCategory = ({category}: CardCategoryProps) => {
	return (
		<div className="flex group cursor-pointer items-center gap-2 justify-start rounded-4xl border-1 border-green-500 bg-green-100 p-2 transition-all hover:border-green-700 hover:bg-green-700 hover:text-white">
			<Image
				src={category.imageUrl}
				alt="category"
				width={100}
				height={100}
				quality={100}
				className="h-[40px] w-[40px] rounded-full object-cover"
			/>
			<h3 className="flex-1 whitespace-nowrap text-sm font-semibold text-emerald-600 group-hover:text-white transition-all ease-in ">{category.name}</h3>
		</div>
	);
};

export default CardCategory;
