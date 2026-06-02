'use client';

import { Button } from '@/components/ui/button';
import { PlusIcon, XIcon } from 'lucide-react';
import React, { useState } from 'react';
import { useProductsFilters } from '../../hooks/use-products-filter';
import { ProductSearchFilter } from './product-search-filter';
import { DEFAULT_PAGE } from '../../../../../constants';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import NewProductDialog from './new-product-dialog';
import ProductCategoryIdFilter from './product-category-filter';
import ProductPriceFilter from './product-price-filter';
import { PRICE_RANGE_MAX } from '../../hooks/use-products-filter';

const ProductListHeader = () => {
	const [filters, setFilters] = useProductsFilters();
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const isAnyFilterModified = !!(
		filters.search ||
		(filters.categorySlugs ?? []).length > 0 ||
		(filters.minPrice ?? 0) > 0 ||
		(filters.maxPrice ?? PRICE_RANGE_MAX) < PRICE_RANGE_MAX
	);

	const onClearFilters = () => {
		setFilters({
			search: '',
			categorySlugs: [],
			minPrice: 0,
			maxPrice: PRICE_RANGE_MAX,
			page: DEFAULT_PAGE,
		});
	};

	return (
		<>
			<NewProductDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />

			<div className="border-b bg-background">
				{/* ── title bar ── */}
				<div className="flex items-center justify-between px-4 py-5 md:px-8">
					<div className="space-y-0.5">
						<h1 className="text-2xl font-bold tracking-tight">Products</h1>
						<p className="text-sm text-muted-foreground">
							Manage your menu items, prices and availability.
						</p>
					</div>

					<Button onClick={() => setIsDialogOpen(true)} className="gap-x-2 shadow-sm">
						<PlusIcon className="size-4" />
						Add Product
					</Button>
				</div>

				{/* ── filter toolbar ── */}
				<div className="border-t bg-muted/30 px-4 py-2.5 md:px-8">
					<ScrollArea>
						<div className="flex items-center gap-x-2">
							<ProductSearchFilter />

							<div className="h-5 w-px bg-border" />

							<ProductCategoryIdFilter />
							<ProductPriceFilter />

							{isAnyFilterModified && (
								<>
									<div className="h-5 w-px bg-border" />
									<Button
										variant="ghost"
										size="sm"
										onClick={onClearFilters}
										className="h-8 gap-x-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
									>
										<XIcon className="size-3" />
										Clear filters
									</Button>
								</>
							)}
						</div>
						<ScrollBar orientation="horizontal" />
					</ScrollArea>
				</div>
			</div>
		</>
	);
};

export default ProductListHeader;
