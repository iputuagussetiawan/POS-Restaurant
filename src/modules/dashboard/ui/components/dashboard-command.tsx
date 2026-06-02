'use client';

import {
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandResponsiveDialog,
	CommandSeparator,
} from '@/components/ui/command';
import React, { Dispatch, SetStateAction, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import GenerateAvatar from '@/components/generate-avatar';
import { useDebounce } from '@/hooks/use-debounce';
import {
	BoxIcon,
	Loader2Icon,
	TagIcon,
	ArrowRightIcon,
	SearchIcon,
	TrendingUpIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Props {
	open: boolean;
	setOpen: Dispatch<SetStateAction<boolean>>;
}

const KBD = ({ children }: { children: React.ReactNode }) => (
	<kbd className="inline-flex h-5 items-center rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
		{children}
	</kbd>
);

const DashboardCommand = ({ open, setOpen }: Props) => {
	const router = useRouter();
	const trpc = useTRPC();
	const [search, setSearch] = useState('');
	const debouncedSearch = useDebounce(search, 300);

	const productsQuery = useQuery(
		trpc.products.getMany.queryOptions({ search: debouncedSearch, pageSize: 6, page: 1 })
	);

	const categoriesQuery = useQuery(
		trpc.categories.getMany.queryOptions({ search: debouncedSearch, pageSize: 4, page: 1 })
	);

	const isLoading = productsQuery.isFetching || categoriesQuery.isFetching;
	const products = productsQuery.data?.items ?? [];
	const categories = categoriesQuery.data?.items ?? [];
	const hasResults = products.length > 0 || categories.length > 0;

	const navigate = (href: string) => {
		router.push(href);
		setOpen(false);
		setSearch('');
	};

	return (
		<CommandResponsiveDialog
			open={open}
			onOpenChange={(v) => {
				setOpen(v);
				if (!v) setSearch('');
			}}
			onInteractOutside={(e) => e.preventDefault()}
			onEscapeKeyDown={() => {
				setOpen(false);
				setSearch('');
			}}
			shouldFilter={false}
			title="Search"
			description="Search products and categories"
			className="sm:max-w-2xl"
		>
			{/* search input */}
			<CommandInput
				placeholder="Search products, categories..."
				value={search}
				onValueChange={setSearch}
				className="text-base"
			/>

			<CommandList className="max-h-[520px] overflow-y-auto">
				{/* loading */}
				{isLoading && (
					<div className="flex flex-col items-center justify-center gap-y-3 py-14">
						<Loader2Icon className="size-6 animate-spin text-muted-foreground" />
						<p className="text-sm text-muted-foreground">Searching…</p>
					</div>
				)}

				{/* idle state */}
				{!isLoading && !debouncedSearch && (
					<div className="p-4">
						<p className="mb-3 px-1 text-xs font-medium text-muted-foreground">
							Quick links
						</p>
						<div className="grid grid-cols-2 gap-2">
							{[
								{
									label: 'All Products',
									href: '/products',
									icon: BoxIcon,
									color: 'bg-blue-50 text-blue-600',
								},
								{
									label: 'Categories',
									href: '/categories',
									icon: TagIcon,
									color: 'bg-purple-50 text-purple-600',
								},
							].map((item) => (
								<button
									key={item.href}
									onClick={() => navigate(item.href)}
									className="flex items-center gap-x-3 rounded-lg border bg-muted/30 px-3 py-3 text-left transition-colors hover:bg-muted"
								>
									<div
										className={cn(
											'flex size-8 shrink-0 items-center justify-center rounded-md',
											item.color
										)}
									>
										<item.icon className="size-4" />
									</div>
									<span className="text-sm font-medium">{item.label}</span>
								</button>
							))}
						</div>

						<div className="mt-4 flex items-center gap-x-1.5 px-1">
							<TrendingUpIcon className="size-3 text-muted-foreground" />
							<p className="text-xs text-muted-foreground">
								Start typing to search across all records
							</p>
						</div>
					</div>
				)}

				{/* no results */}
				{!isLoading && debouncedSearch && !hasResults && (
					<div className="flex flex-col items-center justify-center gap-y-3 py-14">
						<div className="flex size-12 items-center justify-center rounded-full bg-muted">
							<SearchIcon className="size-5 text-muted-foreground" />
						</div>
						<div className="text-center">
							<p className="text-sm font-medium">No results found</p>
							<p className="mt-0.5 text-xs text-muted-foreground">
								No matches for &ldquo;
								<span className="font-medium text-foreground">
									{debouncedSearch}
								</span>
								&rdquo;
							</p>
						</div>
					</div>
				)}

				{/* products */}
				{!isLoading && products.length > 0 && (
					<CommandGroup heading="Products">
						{products.map((product) => (
							<CommandItem
								key={product.id}
								value={product.id}
								onSelect={() => navigate(`/products/${product.id}`)}
								className="group mx-1 flex items-center gap-x-3 rounded-lg px-3 py-2.5"
							>
								<div className="relative size-11 shrink-0 overflow-hidden rounded-lg border bg-muted shadow-sm">
									<Image
										src={product.imageUrl}
										alt={product.name}
										fill
										sizes="44px"
										className="object-cover"
									/>
								</div>
								<div className="flex min-w-0 flex-1 flex-col gap-y-0.5">
									<span className="truncate text-sm leading-tight font-medium">
										{product.name}
									</span>
									<div className="flex items-center gap-x-1.5 text-xs text-muted-foreground">
										<span className="font-semibold text-foreground">
											${Number(product.price).toFixed(2)}
										</span>
										{product.categories?.name && (
											<>
												<span className="opacity-40">·</span>
												<span className="truncate">
													{product.categories.name}
												</span>
											</>
										)}
									</div>
								</div>
								<div className="flex shrink-0 items-center gap-x-2">
									{product.isAvailable ? (
										<Badge className="border-green-200 bg-green-50 text-[10px] text-green-700 hover:bg-green-50">
											● Available
										</Badge>
									) : (
										<Badge
											variant="outline"
											className="text-[10px] text-muted-foreground"
										>
											● Unavailable
										</Badge>
									)}
									<ArrowRightIcon className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-data-[selected=true]:opacity-100" />
								</div>
							</CommandItem>
						))}
						{(productsQuery.data?.total ?? 0) > 6 && (
							<CommandItem
								value="view-all-products"
								onSelect={() => navigate(`/products?search=${debouncedSearch}`)}
								className="mx-1 justify-center gap-x-1.5 rounded-lg text-xs font-medium text-primary hover:text-primary"
							>
								View all {productsQuery.data?.total} products
								<ArrowRightIcon className="size-3" />
							</CommandItem>
						)}
					</CommandGroup>
				)}

				{!isLoading && products.length > 0 && categories.length > 0 && (
					<CommandSeparator className="my-1" />
				)}

				{/* categories */}
				{!isLoading && categories.length > 0 && (
					<CommandGroup heading="Categories">
						{categories.map((category) => (
							<CommandItem
								key={category.id}
								value={category.id}
								onSelect={() => navigate(`/categories/${category.id}`)}
								className="group mx-1 flex items-center gap-x-3 rounded-lg px-3 py-2.5"
							>
								<div className="relative size-11 shrink-0 overflow-hidden rounded-lg border bg-muted shadow-sm">
									{category.imageUrl ? (
										<Image
											src={category.imageUrl}
											alt={category.name}
											fill
											sizes="44px"
											className="object-cover"
										/>
									) : (
										<GenerateAvatar
											seed={category.name}
											variant="botttsNeutral"
											className="size-full"
										/>
									)}
								</div>
								<div className="flex min-w-0 flex-1 flex-col gap-y-0.5">
									<span className="truncate text-sm leading-tight font-medium capitalize">
										{category.name}
									</span>
									{category.description && (
										<span className="truncate text-xs text-muted-foreground">
											{category.description}
										</span>
									)}
								</div>
								<div className="flex shrink-0 items-center gap-x-2">
									<TagIcon className="size-3.5 text-muted-foreground" />
									<ArrowRightIcon className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-data-[selected=true]:opacity-100" />
								</div>
							</CommandItem>
						))}
						{(categoriesQuery.data?.total ?? 0) > 4 && (
							<CommandItem
								value="view-all-categories"
								onSelect={() => navigate(`/categories?search=${debouncedSearch}`)}
								className="mx-1 justify-center gap-x-1.5 rounded-lg text-xs font-medium text-primary hover:text-primary"
							>
								View all {categoriesQuery.data?.total} categories
								<ArrowRightIcon className="size-3" />
							</CommandItem>
						)}
					</CommandGroup>
				)}
			</CommandList>

			{/* footer */}
			<div className="flex items-center justify-between border-t bg-muted/30 px-4 py-2">
				<div className="flex items-center gap-x-3">
					<span className="flex items-center gap-x-1 text-xs text-muted-foreground">
						<KBD>↑↓</KBD> navigate
					</span>
					<span className="flex items-center gap-x-1 text-xs text-muted-foreground">
						<KBD>↵</KBD> open
					</span>
					<span className="flex items-center gap-x-1 text-xs text-muted-foreground">
						<KBD>Esc</KBD> close
					</span>
				</div>
				{debouncedSearch && hasResults && (
					<p className="text-xs text-muted-foreground">
						{(productsQuery.data?.total ?? 0) + (categoriesQuery.data?.total ?? 0)}{' '}
						results
					</p>
				)}
			</div>
		</CommandResponsiveDialog>
	);
};

export default DashboardCommand;
