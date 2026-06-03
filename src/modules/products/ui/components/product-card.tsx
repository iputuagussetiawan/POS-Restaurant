'use client';

import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { ProductGetMany } from '../../types';

interface Props {
	product: ProductGetMany[number];
	onClick: () => void;
}

const ProductCard = ({ product, onClick }: Props) => {
	return (
		<div
			onClick={onClick}
			className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
		>
			<div className="relative aspect-square overflow-hidden bg-muted">
				<Image
					src={product.imageUrl}
					alt={product.name}
					fill
					sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
					className="object-cover transition-transform duration-300 group-hover:scale-105"
				/>
			</div>
			<div className="flex flex-col gap-1 p-3">
				<p className="truncate text-sm leading-tight font-semibold capitalize">
					{product.name}
				</p>
				{product.categories?.name && (
					<Badge variant="secondary" className="w-fit truncate text-xs capitalize">
						{product.categories.name}
					</Badge>
				)}
			</div>
		</div>
	);
};

export default ProductCard;
