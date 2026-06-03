import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePOSFilters } from '@/modules/pos/hooks/use-pos-filter';
import { Search } from 'lucide-react';
import React, { useState } from 'react';

const ProductSearch = () => {
	const [filters, setFilters] = usePOSFilters();
	const [inputValue, setInputValue] = useState(filters.search || '');
	const handleSearchClick = () => {
		setFilters({ search: inputValue });
	};
	return (
		<div className="relative w-full">
			<Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
			<Input
				onChange={(e) => setInputValue(e.target.value)}
				placeholder="Search for a product..."
				className="h-12 rounded-full py-4 pr-16 pl-10 text-gray-500 shadow-none transition-all duration-300 ease-in-out focus-visible:border-green-700 focus-visible:border-r-green-700 focus-visible:shadow-none focus-visible:ring-0 focus-visible:outline-0"
			/>
			<Button
				onClick={handleSearchClick}
				className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-green-700 text-white transition-all duration-300 ease-in-out hover:bg-green-800"
			>
				Search
			</Button>
		</div>
	);
};

export default ProductSearch;
