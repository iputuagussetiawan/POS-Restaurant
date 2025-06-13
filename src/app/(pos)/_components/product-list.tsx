import React from 'react';
import CardProduct from './cards/card-product';

const ProductList = () => {
	return (
		<div className='grid grid-cols-5 gap-4'>
			<CardProduct />
		</div>
	)
};

export default ProductList;
