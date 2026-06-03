'use client';
import { Input } from '@/components/ui/input';
import { usePOSFilters } from '@/modules/pos/hooks/use-pos-filter';
import { Search, XIcon } from 'lucide-react';
import React, { useState } from 'react';

const ProductSearch = () => {
	const [filters, setFilters] = usePOSFilters();
	const [value, setValue] = useState(filters.search || '');

	const commit = (val: string) => setFilters({ search: val, page: 1 });

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') commit(value);
	};

	const handleClear = () => {
		setValue('');
		commit('');
	};

	return (
		<div className="relative flex items-center">
			<Search className="absolute left-3 h-4 w-4 text-gray-400" />
			<Input
				value={value}
				onChange={(e) => setValue(e.target.value)}
				onKeyDown={handleKeyDown}
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

export default ProductSearch;
