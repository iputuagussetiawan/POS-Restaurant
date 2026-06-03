'use client';
import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';
import { usePOSFilters } from '@/modules/pos/hooks/use-pos-filter';
import { Skeleton } from '@/components/ui/skeleton';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronDownIcon, LayoutGridIcon, CheckIcon } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const CategoryList = () => {
	const [open, setOpen] = useState(false);
	const [filters, setFilters] = usePOSFilters();
	const trpc = useTRPC();
	const { data, isLoading } = useQuery(
		trpc.categories.getMany.queryOptions({ pageSize: 100, search: '' })
	);

	const selectedName = filters.categorySlug
		? (data?.items.find((c) => c.slug === filters.categorySlug)?.name ?? filters.categorySlug)
		: 'All Categories';

	const handleSelect = (slug: string) => {
		setFilters({ categorySlug: slug, page: 1 });
		setOpen(false);
	};

	if (isLoading) {
		return <Skeleton className="h-9 w-44 rounded-full" />;
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					className="flex items-center gap-2 rounded-full border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-green-500 hover:text-green-700"
				>
					<LayoutGridIcon className="h-4 w-4 text-gray-400" />
					{selectedName}
					<ChevronDownIcon className="ml-1 h-3.5 w-3.5 text-gray-400" />
				</Button>
			</DialogTrigger>

			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>Select Category</DialogTitle>
				</DialogHeader>

				<div className="grid grid-cols-3 gap-2 pt-2">
					{/* All */}
					<button
						onClick={() => handleSelect('')}
						className={cn(
							'flex flex-col items-center gap-2 rounded-xl border p-3 text-xs font-medium transition-all hover:border-green-500 hover:bg-green-50',
							!filters.categorySlug
								? 'border-green-600 bg-green-50 text-green-700'
								: 'border-gray-100 bg-gray-50 text-gray-600'
						)}
					>
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
							<LayoutGridIcon className="h-5 w-5 text-green-600" />
						</div>
						<span>All</span>
						{!filters.categorySlug && <CheckIcon className="h-3 w-3 text-green-600" />}
					</button>

					{data?.items.map((category) => {
						const isSelected = filters.categorySlug === category.slug;
						return (
							<button
								key={category.id}
								onClick={() => handleSelect(category.slug)}
								className={cn(
									'flex flex-col items-center gap-2 rounded-xl border p-3 text-xs font-medium transition-all hover:border-green-500 hover:bg-green-50',
									isSelected
										? 'border-green-600 bg-green-50 text-green-700'
										: 'border-gray-100 bg-gray-50 text-gray-600'
								)}
							>
								{category.imageUrl ? (
									<Image
										src={category.imageUrl}
										alt={category.name}
										width={40}
										height={40}
										className="h-10 w-10 rounded-full object-cover"
									/>
								) : (
									<div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-lg">
										🍽️
									</div>
								)}
								<span className="line-clamp-1 text-center">{category.name}</span>
								{isSelected && <CheckIcon className="h-3 w-3 text-green-600" />}
							</button>
						);
					})}
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default CategoryList;
