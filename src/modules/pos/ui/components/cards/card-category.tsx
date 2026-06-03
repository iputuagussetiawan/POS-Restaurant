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
		<button
			onClick={() => onSelect(category.id)}
			className={cn(
				'group flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all duration-200',
				isSelected
					? 'border-green-700 bg-green-700 text-white'
					: 'border-gray-200 bg-white text-gray-600 hover:border-green-600 hover:bg-green-50 hover:text-green-700',
				className
			)}
		>
			{category.imageUrl && (
				<Image
					src={category.imageUrl}
					alt={category.name}
					width={20}
					height={20}
					quality={90}
					className="h-5 w-5 rounded-full object-cover"
				/>
			)}
			{category.name}
		</button>
	);
};

export default CardCategory;
