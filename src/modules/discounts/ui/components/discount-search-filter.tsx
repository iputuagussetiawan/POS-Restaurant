'use client';

import { useEffect, useState } from 'react';
import { SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDiscountsFilters } from '../../hooks/use-discounts-filter';
import { useDebounce } from '@/hooks/use-debounce';

export const DiscountSearchFilter = () => {
	const [filters, setFilters] = useDiscountsFilters();
	const [inputValue, setInputValue] = useState(filters.search ?? '');
	const debouncedValue = useDebounce(inputValue, 400);

	useEffect(() => {
		setFilters({ search: debouncedValue, page: 1 });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedValue]);

	useEffect(() => {
		if (!filters.search) setInputValue('');
	}, [filters.search]);

	return (
		<div className="relative flex-1">
			<Input
				className="h-8 w-full bg-background pl-7 text-sm"
				type="text"
				placeholder="Search by name or code..."
				value={inputValue}
				onChange={(e) => setInputValue(e.target.value)}
			/>
			<SearchIcon className="absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
		</div>
	);
};
