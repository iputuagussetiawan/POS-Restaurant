import React from 'react';
import CardProduct from './cards/card-product';
import { POSGetMany } from '@/modules/pos/types';

interface ProductListProps {
	data?: POSGetMany;
}

const ProductList = ({ data }: ProductListProps) => {
	return (
		<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
			{data?.map((item) => (
				<CardProduct key={item.id} data={item} />
			))}
		</div>
	);
};

export default ProductList;
