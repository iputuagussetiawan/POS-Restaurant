import React from 'react';
import CardProduct from './cards/card-product';
import { POSGetMany } from '@/modules/pos/types';


interface ProductListProps {
	data?: POSGetMany;
}

const ProductList = ({data}: ProductListProps) => {
	return (
		<div className='grid grid-cols-5 gap-4'>
			{ data?.map((item) => (
				<CardProduct key={item.id} data={item} />
			))}
		</div>
	)
};

export default ProductList;
