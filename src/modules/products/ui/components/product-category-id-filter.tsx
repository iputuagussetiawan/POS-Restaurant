import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';
import { CommandSelect } from '@/components/command-select';
import { useProductsFilters } from '../../hooks/use-products-filter';

import React from 'react';
import GenerateAvatar from '@/components/generate-avatar';

const ProductCategoryIdFilter = () => {
	const [filters, setFilters] = useProductsFilters();
	const trpc = useTRPC();
	const [categorySearch, setCategorySearch] = useState('');
	const { data } = useQuery(
		trpc.categories.getMany.queryOptions({
			pageSize: 100,
			search: categorySearch,
		})
	);
	return (
		<CommandSelect
			className="h-9"
			placeholder="Filter category..."
			options={(data?.items ?? []).map((category) => ({
				id: category.id,
				value: category.id,
				children: (
					<div className="flex items-center gap-x-2">
						<GenerateAvatar
							seed={category.name}
							variant="botttsNeutral"
							className="size-4"
						/>
						<span>{category.name}</span>
					</div>
				),
			}))}
			onSelect={(value) => setFilters({ categoryId: value })}
			onSearch={setCategorySearch}
			value={filters.categoryId ?? ''}
		/>
	);
};

export default ProductCategoryIdFilter;
