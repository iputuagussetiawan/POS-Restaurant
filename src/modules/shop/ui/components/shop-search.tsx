'use client';

import { Input } from '@/components/ui/input';
import { useShopFilters } from '../../hooks/use-shop-filter';
import { Search, XIcon } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/use-debounce';

const ShopSearch = () => {
	const [filters, setFilters] = useShopFilters();
	const [value, setValue] = useState(filters.search || '');

	const debounced = useDebounce(value, 400);

	/* commit to URL whenever debounced value settles */
	useEffect(() => {
		if (debounced !== filters.search) {
			setFilters({ search: debounced, page: 1 });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debounced]);

	const handleClear = () => {
		setValue('');
	};

	return (
		<div className="relative flex items-center">
			<Search className="absolute left-3 h-4 w-4 text-gray-400" />
			<Input
				value={value}
				onChange={(e) => setValue(e.target.value)}
				placeholder="Search products..."
				className="h-9 rounded-full border-gray-200 bg-white pr-8 pl-9 text-sm text-gray-700 shadow-none placeholder:text-gray-400 focus-visible:border-green-500 focus-visible:ring-0"
			/>
			{value && (
				<button
					onClick={handleClear}
					className="absolute right-3 text-gray-400 hover:text-gray-600"
				>
					<XIcon className="h-3.5 w-3.5" />
				</button>
			)}
		</div>
	);
};

export default ShopSearch;
