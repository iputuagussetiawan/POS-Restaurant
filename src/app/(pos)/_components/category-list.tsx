import React from 'react';
import CardCategory from './cards/card-category';

const CategoryList = () => {
	return (
		<div className='grid grid-cols-8 gap-4'>
			<CardCategory />
		</div>
	)
};

export default CategoryList;
