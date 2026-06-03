'use client';

import { Button } from '@/components/ui/button';
import { PlusIcon, XIcon } from 'lucide-react';
import React, { useState } from 'react';
import NewAgentDialog from './new-agent-dialog';
import { DEFAULT_PAGE } from '../../../../../constants';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useCategoriesFilters } from '../../hooks/use-categories-filter';
import { CategoriesSearchFilter } from './categories-search-filter';

const CategoriesListHeader = () => {
	const [filters, setFilters] = useCategoriesFilters();
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const isAnyFilterModified = !!filters.search;

	const onClearFilters = () => {
		setFilters({ search: '', page: DEFAULT_PAGE });
	};

	return (
		<>
			<NewAgentDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />

			{/* title bar — scrolls away */}
			<div className="border-b bg-background px-4 py-4 md:px-8 md:py-5">
				<div className="space-y-0.5">
					<h1 className="text-xl font-bold tracking-tight md:text-2xl">
						Product Categories
					</h1>
					<p className="text-sm text-muted-foreground">
						Organise your menu by grouping products into categories.
					</p>
				</div>
			</div>

			{/* filter toolbar — sticky */}
			<div className="sticky top-[57px] z-10 border-b bg-background/80 px-4 py-2.5 backdrop-blur-md md:px-8">
				<ScrollArea>
					<div className="flex w-full items-center gap-x-2">
						<CategoriesSearchFilter />
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
		</>
	);
};

export default CategoriesListHeader;
