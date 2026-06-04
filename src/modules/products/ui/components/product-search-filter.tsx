'use client';

import { useEffect, useState } from 'react';
import { SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useProductsFilters } from '../../hooks/use-products-filter';
import { useDebounce } from '@/hooks/use-debounce';

export const ProductSearchFilter = () => {
	const [filters, setFilters] = useProductsFilters();
	const [inputValue, setInputValue] = useState(filters.search ?? '');
	const debouncedValue = useDebounce(inputValue, 400);

	useEffect(() => {
		setFilters({ search: debouncedValue, page: 1 });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedValue]);

	// sync back if filters cleared externally (e.g. "Clear filters" button)
	useEffect(() => {
		if (!filters.search) setInputValue('');
	}, [filters.search]);

	return (
		<div className="relative flex-1">
			<Input
				className="h-8 w-full bg-background pl-7 text-sm"
				type="text"
				placeholder="Search..."
				value={inputValue}
				onChange={(e) => setInputValue(e.target.value)}
			/>
			<SearchIcon className="absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
		</div>
	);
};
