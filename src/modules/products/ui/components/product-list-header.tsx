'use client';
import { Button } from '@/components/ui/button';
import { PlusIcon, XCircleIcon } from 'lucide-react';
import React, { useState } from 'react';
import {useProductsFilters } from '../../hooks/use-products-filter';
import { AgentsSearchFilter } from './product-search-filter';
import { DEFAULT_PAGE } from '../../../../../constants';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import NewProductDialog from './new-product-dialog';

const ProductListHeader = () => {
	const [filters, setFilters] = useProductsFilters();
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const isAnyFilterModified = !!filters.search;
	const onClearFilters = () => {
		setFilters({
			search: '',
			page: DEFAULT_PAGE,
		});
	};
	return (
		<>
			<NewProductDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
			<div className="flex flex-col gap-y-4 px-4 py-4 md:px-8">
				<div className="flex items-center justify-between">
					<h5 className="text-xl font-medium">My Products</h5>
					<Button onClick={() => setIsDialogOpen(true)}>
						<PlusIcon />
						New Product
					</Button>
				</div>

				<ScrollArea>
					<div className="flex items-center gap-x-2 p-1">
						<AgentsSearchFilter />
						{isAnyFilterModified && (
							<Button variant={'outline'} size={'sm'} onClick={onClearFilters}>
								<XCircleIcon />
								Clear
							</Button>
						)}
					</div>
					<ScrollBar orientation="horizontal" />
				</ScrollArea>
			</div>
		</>
	);
};

export default ProductListHeader;
