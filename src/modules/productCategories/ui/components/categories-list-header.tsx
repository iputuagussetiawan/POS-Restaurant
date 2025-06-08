'use client';
import { Button } from '@/components/ui/button';
import { PlusIcon, XCircleIcon } from 'lucide-react';
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
		setFilters({
			search: '',
			page: DEFAULT_PAGE,
		});
	};
	return (
		<>
			<NewAgentDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
			<div className="flex flex-col gap-y-4 px-4 py-4 md:px-8">
				<div className="flex items-center justify-between">
					<h5 className="text-xl font-medium">My Categories</h5>
					<Button onClick={() => setIsDialogOpen(true)}>
						<PlusIcon />
						New Categories
					</Button>
				</div>

				<ScrollArea>
					<div className="flex items-center gap-x-2 p-1">
						<CategoriesSearchFilter />
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

export default CategoriesListHeader;
