'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';
import { useProductsFilters } from '../../hooks/use-products-filter';
import Image from 'next/image';
import GenerateAvatar from '@/components/generate-avatar';
import { Button } from '@/components/ui/button';
import {
	CommandEmpty,
	CommandInput,
	CommandItem,
	CommandList,
	CommandResponsiveDialog,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { ChevronDownIcon, XIcon, CheckIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';

const ProductCategoryIdFilter = () => {
	const [filters, setFilters] = useProductsFilters();
	const trpc = useTRPC();
	const [open, setOpen] = useState(false);
	const [categorySearch, setCategorySearch] = useState('');
	const debouncedCategorySearch = useDebounce(categorySearch, 400);

	const { data } = useQuery(
		trpc.categories.getMany.queryOptions({ pageSize: 100, search: debouncedCategorySearch })
	);

	const allCategories = data?.items ?? [];
	const selectedSlugs: string[] = filters.categorySlugs ?? [];
	const selectedCategories = allCategories.filter((c) => selectedSlugs.includes(c.slug));
	const hasSelection = selectedSlugs.length > 0;

	const toggle = (slug: string) => {
		const next = selectedSlugs.includes(slug)
			? selectedSlugs.filter((v) => v !== slug)
			: [...selectedSlugs, slug];
		setFilters({ categorySlugs: next, page: 1 });
	};

	const clear = (e: React.MouseEvent) => {
		e.stopPropagation();
		setFilters({ categorySlugs: [], page: 1 });
	};

	const avatarPreview = selectedCategories.slice(0, 3);
	const overflowCount = selectedSlugs.length - avatarPreview.length;

	return (
		<>
			<Button
				type="button"
				variant="outline"
				onClick={() => setOpen(true)}
				className={cn(
					'h-8 gap-x-2 px-3 text-sm font-normal transition-colors',
					hasSelection && 'border-primary/50 bg-primary/5 text-foreground'
				)}
			>
				{hasSelection ? (
					<>
						<div className="flex items-center -space-x-1">
							{avatarPreview.map((cat) => (
								<div
									key={cat.id}
									className="size-5 overflow-hidden rounded-sm ring-2 ring-background"
								>
									{cat.imageUrl ? (
										<Image
											src={cat.imageUrl}
											alt={cat.name}
											width={20}
											height={20}
											className="size-full object-cover"
										/>
									) : (
										<GenerateAvatar
											seed={cat.name}
											variant="botttsNeutral"
											className="size-full"
										/>
									)}
								</div>
							))}
						</div>
						<span className="text-sm font-medium">
							{selectedSlugs.length === 1
								? selectedCategories[0]?.name
								: `${selectedSlugs.length} categories`}
						</span>
						{overflowCount > 0 && (
							<Badge variant="secondary" className="h-5 px-1.5 text-xs">
								+{overflowCount}
							</Badge>
						)}
						<XIcon
							className="size-3.5 text-muted-foreground hover:text-foreground"
							onClick={clear}
						/>
					</>
				) : (
					<>
						<span className="text-muted-foreground">Category</span>
						<ChevronDownIcon className="size-3.5 text-muted-foreground" />
					</>
				)}
			</Button>

			<CommandResponsiveDialog
				open={open}
				onOpenChange={(v) => {
					if (!v) setCategorySearch('');
					setOpen(v);
				}}
				shouldFilter={false}
			>
				<CommandInput
					placeholder="Search categories..."
					onValueChange={setCategorySearch}
				/>
				<CommandList className="max-h-72">
					<CommandEmpty>
						<span className="text-sm text-muted-foreground">No categories found.</span>
					</CommandEmpty>

					{hasSelection && !categorySearch && (
						<>
							{selectedCategories.map((category) => (
								<CommandItem
									key={`sel-${category.slug}`}
									value={category.slug}
									onSelect={() => toggle(category.slug)}
									className="flex items-center gap-x-3 py-2.5"
								>
									<div className="flex size-8 shrink-0 overflow-hidden rounded-md shadow-sm">
										{category.imageUrl ? (
											<Image
												src={category.imageUrl}
												alt={category.name}
												width={32}
												height={32}
												className="size-full object-cover"
											/>
										) : (
											<GenerateAvatar
												seed={category.name}
												variant="botttsNeutral"
												className="size-full"
											/>
										)}
									</div>
									<span className="flex-1 text-sm font-medium">
										{category.name}
									</span>
									<CheckIcon className="size-4 text-primary" />
								</CommandItem>
							))}
							<div className="mx-2 my-1 border-t" />
						</>
					)}

					{allCategories
						.filter((c) => !selectedSlugs.includes(c.slug))
						.map((category) => (
							<CommandItem
								key={category.slug}
								value={category.slug}
								onSelect={() => toggle(category.slug)}
								className="flex items-center gap-x-3 py-2.5"
							>
								<div className="flex size-8 shrink-0 overflow-hidden rounded-md shadow-sm">
									{category.imageUrl ? (
										<Image
											src={category.imageUrl}
											alt={category.name}
											width={32}
											height={32}
											className="size-full object-cover"
										/>
									) : (
										<GenerateAvatar
											seed={category.name}
											variant="botttsNeutral"
											className="size-full"
										/>
									)}
								</div>
								<span className="flex-1 text-sm">{category.name}</span>
							</CommandItem>
						))}
				</CommandList>
			</CommandResponsiveDialog>
		</>
	);
};

export default ProductCategoryIdFilter;
