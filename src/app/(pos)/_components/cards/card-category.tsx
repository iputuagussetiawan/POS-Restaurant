import { cn } from '@/lib/utils';
import Image from 'next/image';
import React from 'react';

interface CardCategoryProps {
	onSelect: (value: string) => void;
	category: {
		id: string;
		name: string;
		imageUrl: string;
	};
	selectedValue: string;
	className?: string;
}

const CardCategory = ({ category, onSelect, selectedValue, className }: CardCategoryProps) => {
	const isSelected = selectedValue === category.id;
	return (
		<div
			onClick={() => {
				onSelect(category.id);
			}}
			className={cn(
				'group flex min-w-[50px] cursor-pointer items-center justify-start gap-2 rounded-4xl border-1 p-2 transition-all',
				isSelected
					? 'border-green-700 bg-green-700 text-white'
					: 'border-green-500 bg-green-100 text-emerald-600 hover:border-green-700 hover:bg-green-700 hover:text-white',
					className
			)}
		>
			{category.imageUrl && (
				<Image
					src={category.imageUrl}
					alt="category"
					width={100}
					height={100}
					quality={100}
					className="h-[20px] w-[20px] rounded-full object-cover"
				/>
			)}
			<h3 className="flex-1 text-xs font-semibold whitespace-nowrap transition-all ease-in group-hover:text-white">
				{category.name}
			</h3>
		</div>
	);
};

export default CardCategory;
