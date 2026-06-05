'use client';

import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';
import { useShopFilters } from '../../hooks/use-shop-filter';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
	LayoutGridIcon,
	CheckIcon,
	SlidersHorizontalIcon,
	XIcon,
	SearchIcon,
	ChevronDownIcon,
	Loader2Icon,
	TagIcon,
	WalletIcon,
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useDebounce } from '@/hooks/use-debounce';
import type { ShopCategory } from '../../types';

type CatQueryResult = {
	items: ShopCategory[];
	total: number;
	hasMore: boolean;
};

const PAGE_SIZE = 8;

const SectionHeader = ({
	icon: Icon,
	label,
	action,
}: {
	icon: React.ElementType;
	label: string;
	action?: React.ReactNode;
}) => (
	<div className="mb-3 flex items-center justify-between">
		<div className="flex items-center gap-1.5">
			<Icon className="h-3.5 w-3.5 text-gray-400" />
			<span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase">
				{label}
			</span>
		</div>
		{action}
	</div>
);

/* ── inner content (shared between sidebar and mobile sheet) ── */
const SidebarContent = ({ onClose }: { onClose?: () => void }) => {
	const trpc = useTRPC();
	const [filters, setFilters] = useShopFilters();

	/* category search + pagination */
	const [catSearch, setCatSearch] = useState('');
	const [catPage, setCatPage] = useState(1);
	const [accumulated, setAccumulated] = useState<ShopCategory[]>([]);

	const debouncedSearch = useDebounce(catSearch, 300);

	const { data: catData, isFetching: catFetching } = useQuery({
		...trpc.shop.getCategories.queryOptions({
			search: debouncedSearch || undefined,
			page: catPage,
			pageSize: PAGE_SIZE,
		}),
		placeholderData: (prev: CatQueryResult | undefined) => prev,
	});

	/* accumulate pages; reset when search changes */
	useEffect(() => {
		if (!catData) return;
		if (catPage === 1) {
			setAccumulated(catData.items as ShopCategory[]);
		} else {
			setAccumulated((prev) => {
				const existingIds = new Set(prev.map((i) => i.id));
				return [
					...prev,
					...(catData.items as ShopCategory[]).filter((i) => !existingIds.has(i.id)),
				];
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [catData]);

	const handleSearchChange = (val: string) => {
		setCatSearch(val);
		setCatPage(1);
		setAccumulated([]);
	};

	const loadMore = () => setCatPage((p) => p + 1);

	/* price inputs */
	const [minInput, setMinInput] = useState(filters.minPrice?.toString() ?? '');
	const [maxInput, setMaxInput] = useState(filters.maxPrice?.toString() ?? '');

	const SLIDER_MAX = 500000;
	const SLIDER_STEP = 5000;

	const debouncedMin = useDebounce(minInput, 500);
	const debouncedMax = useDebounce(maxInput, 500);

	/* auto-apply price when debounced inputs settle */
	useEffect(() => {
		const min = debouncedMin !== '' ? parseInt(debouncedMin, 10) : null;
		const max = debouncedMax !== '' ? parseInt(debouncedMax, 10) : null;
		const curMin = filters.minPrice ?? null;
		const curMax = filters.maxPrice ?? null;
		if (min !== curMin || max !== curMax) {
			setFilters({ minPrice: min, maxPrice: max, page: 1 });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedMin, debouncedMax]);

	const hasActivePrice = filters.minPrice != null || filters.maxPrice != null;
	const hasActiveFilter = !!filters.categorySlug || hasActivePrice;

	const applyPrice = () => {
		const min = minInput !== '' ? parseInt(minInput, 10) : null;
		const max = maxInput !== '' ? parseInt(maxInput, 10) : null;
		setFilters({ minPrice: min, maxPrice: max, page: 1 });
		onClose?.();
	};

	const clearPrice = () => {
		setMinInput('');
		setMaxInput('');
		setFilters({ minPrice: null, maxPrice: null, page: 1 });
	};

	const handleCategory = (slug: string) => {
		setFilters({ categorySlug: slug, page: 1 });
		onClose?.();
	};

	const clearAll = () => {
		setMinInput('');
		setMaxInput('');
		setFilters({ categorySlug: '', minPrice: null, maxPrice: null, page: 1 });
		onClose?.();
	};

	const displayItems =
		accumulated.length > 0 ? accumulated : ((catData?.items as ShopCategory[]) ?? []);
	const isFirstLoad = catFetching && catPage === 1 && accumulated.length === 0;

	return (
		<div className="flex flex-col gap-5">
			{/* Clear all */}
			{hasActiveFilter && (
				<button
					onClick={clearAll}
					className="flex items-center gap-1.5 self-start rounded-lg bg-red-50 px-3 py-1.5 text-[11px] font-semibold text-red-500 transition-colors hover:bg-red-100"
				>
					<XIcon className="h-3 w-3" />
					Clear all filters
				</button>
			)}

			{/* ── Categories ── */}
			<div>
				<SectionHeader icon={TagIcon} label="Category" />

				{/* Search */}
				<div className="relative mb-2">
					<SearchIcon className="absolute top-1/2 left-2.5 h-3 w-3 -translate-y-1/2 text-gray-300" />
					<Input
						value={catSearch}
						onChange={(e) => handleSearchChange(e.target.value)}
						placeholder="Search…"
						className="h-8 rounded-lg border-gray-200 bg-white pr-7 pl-7 text-xs shadow-none focus-visible:border-green-500 focus-visible:ring-0"
					/>
					{catSearch && (
						<button
							onClick={() => handleSearchChange('')}
							className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
						>
							<XIcon className="h-3 w-3" />
						</button>
					)}
				</div>

				{/* List */}
				<div className="flex flex-col gap-0.5">
					{/* "All" row — only when not searching */}
					{!catSearch && (
						<button
							onClick={() => handleCategory('')}
							className={cn(
								'flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors',
								!filters.categorySlug
									? 'bg-green-50 text-green-700'
									: 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
							)}
						>
							<div
								className={cn(
									'flex h-6 w-6 shrink-0 items-center justify-center rounded-md',
									!filters.categorySlug ? 'bg-green-100' : 'bg-gray-100'
								)}
							>
								<LayoutGridIcon
									className={cn(
										'h-3 w-3',
										!filters.categorySlug ? 'text-green-600' : 'text-gray-400'
									)}
								/>
							</div>
							<span
								className={cn(
									'flex-1 text-left text-xs',
									!filters.categorySlug ? 'font-semibold' : 'font-medium'
								)}
							>
								All Categories
							</span>
							{!filters.categorySlug && (
								<CheckIcon className="h-3.5 w-3.5 shrink-0 text-green-600" />
							)}
						</button>
					)}

					{isFirstLoad ? (
						Array.from({ length: 5 }).map((_, i) => (
							<Skeleton key={i} className="h-9 w-full rounded-lg" />
						))
					) : displayItems.length === 0 ? (
						<p className="px-2 py-4 text-center text-xs text-gray-400">
							No categories found
						</p>
					) : (
						displayItems.map((cat) => {
							const isSelected = filters.categorySlug === cat.slug;
							return (
								<button
									key={cat.id}
									onClick={() => handleCategory(cat.slug)}
									className={cn(
										'flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors',
										isSelected
											? 'bg-green-50 text-green-700'
											: 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
									)}
								>
									<div className="h-6 w-6 shrink-0 overflow-hidden rounded-md bg-gray-100">
										{cat.imageUrl ? (
											<Image
												src={cat.imageUrl}
												alt={cat.name}
												width={24}
												height={24}
												className="h-full w-full object-cover"
											/>
										) : (
											<div className="flex h-full w-full items-center justify-center text-[10px]">
												🍽️
											</div>
										)}
									</div>
									<span
										className={cn(
											'flex-1 truncate text-left text-xs',
											isSelected ? 'font-semibold' : 'font-medium'
										)}
									>
										{cat.name}
									</span>
									{isSelected && (
										<CheckIcon className="h-3.5 w-3.5 shrink-0 text-green-600" />
									)}
								</button>
							);
						})
					)}
				</div>

				{/* Load more */}
				{catData?.hasMore && (
					<button
						onClick={loadMore}
						disabled={catFetching}
						className="mt-1.5 flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-gray-200 py-1.5 text-[11px] font-medium text-gray-400 transition-colors hover:border-green-300 hover:text-green-600 disabled:opacity-50"
					>
						{catFetching ? (
							<Loader2Icon className="h-3 w-3 animate-spin" />
						) : (
							<>
								<ChevronDownIcon className="h-3 w-3" />
								Load more
							</>
						)}
					</button>
				)}
			</div>

			<div className="h-px bg-gray-100" />

			{/* ── Price range ── */}
			<div>
				<SectionHeader
					icon={WalletIcon}
					label="Price Range"
					action={
						hasActivePrice ? (
							<button
								onClick={clearPrice}
								className="text-[11px] font-semibold text-red-400 hover:text-red-600"
							>
								Clear
							</button>
						) : undefined
					}
				/>

				{/* Range slider */}
				<Slider
					min={0}
					max={SLIDER_MAX}
					step={SLIDER_STEP}
					value={[
						minInput !== '' ? Number(minInput) : 0,
						maxInput !== '' ? Number(maxInput) : SLIDER_MAX,
					]}
					onValueChange={([min, max]) => {
						setMinInput(min === 0 ? '' : String(min));
						setMaxInput(max === SLIDER_MAX ? '' : String(max));
					}}
					className="mb-4 [&_[data-slot=slider-range]]:bg-green-500 [&_[data-slot=slider-thumb]]:border-green-500 [&_[data-slot=slider-thumb]]:ring-green-200 [&_[data-slot=slider-track]]:bg-gray-100"
				/>

				<div className="flex items-center gap-2">
					<div className="flex-1">
						<p className="mb-1 text-[10px] font-medium text-gray-400">Min</p>
						<Input
							type="number"
							min={0}
							value={minInput}
							onChange={(e) => setMinInput(e.target.value)}
							placeholder="0"
							className="h-8 rounded-lg border-gray-200 bg-white text-xs shadow-none focus-visible:border-green-500 focus-visible:ring-0"
						/>
					</div>
					<span className="mt-4 text-xs text-gray-300">—</span>
					<div className="flex-1">
						<p className="mb-1 text-[10px] font-medium text-gray-400">Max</p>
						<Input
							type="number"
							min={0}
							value={maxInput}
							onChange={(e) => setMaxInput(e.target.value)}
							placeholder="∞"
							className="h-8 rounded-lg border-gray-200 bg-white text-xs shadow-none focus-visible:border-green-500 focus-visible:ring-0"
						/>
					</div>
				</div>

				{/* Presets */}
				<div className="mt-2.5 grid grid-cols-2 gap-1.5">
					{[
						{ label: 'Under 50k', min: null, max: 50000 },
						{ label: '50k – 100k', min: 50000, max: 100000 },
						{ label: '100k – 200k', min: 100000, max: 200000 },
						{ label: 'Over 200k', min: 200000, max: null },
					].map((preset) => {
						const active =
							(filters.minPrice ?? null) === preset.min &&
							(filters.maxPrice ?? null) === preset.max;
						return (
							<button
								key={preset.label}
								onClick={() => {
									setMinInput(preset.min?.toString() ?? '');
									setMaxInput(preset.max?.toString() ?? '');
									setFilters({
										minPrice: preset.min,
										maxPrice: preset.max,
										page: 1,
									});
									onClose?.();
								}}
								className={cn(
									'rounded-lg border py-1.5 text-[10px] font-semibold transition-colors',
									active
										? 'border-green-500 bg-green-50 text-green-700'
										: 'border-gray-200 bg-white text-gray-500 hover:border-green-300 hover:bg-green-50 hover:text-green-700'
								)}
							>
								{preset.label}
							</button>
						);
					})}
				</div>

				<Button
					onClick={applyPrice}
					size="sm"
					className="mt-3 h-8 w-full rounded-lg bg-green-600 text-[11px] font-semibold text-white hover:bg-green-700"
				>
					Apply Price
				</Button>
			</div>
		</div>
	);
};

/* ── desktop sidebar ── */
export const ShopSidebar = () => (
	<aside className="hidden w-52 shrink-0 lg:block xl:w-60">
		<div className="sticky top-[calc(3.5rem+49px)] max-h-[calc(100vh-7rem)] overflow-y-auto rounded-xl border border-gray-100 bg-white p-4">
			<SidebarContent />
		</div>
	</aside>
);

/* ── mobile filter sheet trigger ── */
export const ShopFilterButton = () => {
	const [open, setOpen] = useState(false);
	const [filters] = useShopFilters();

	const activeCount =
		(filters.categorySlug ? 1 : 0) +
		(filters.minPrice != null || filters.maxPrice != null ? 1 : 0);

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<button
					className={cn(
						'flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors lg:hidden',
						activeCount > 0
							? 'border-green-500 bg-green-50 text-green-700'
							: 'border-gray-200 bg-white text-gray-600 hover:border-green-400 hover:text-green-700'
					)}
				>
					<SlidersHorizontalIcon className="h-4 w-4" />
					Filters
					{activeCount > 0 && (
						<span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-[11px] font-bold text-white">
							{activeCount}
						</span>
					)}
				</button>
			</SheetTrigger>
			<SheetContent side="left" className="w-72 overflow-y-auto p-5">
				<SheetHeader className="mb-5 p-0">
					<SheetTitle>Filters</SheetTitle>
				</SheetHeader>
				<SidebarContent onClose={() => setOpen(false)} />
			</SheetContent>
		</Sheet>
	);
};
