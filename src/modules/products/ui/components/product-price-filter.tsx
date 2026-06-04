'use client';

import { useState, useEffect } from 'react';
import { useProductsFilters, PRICE_RANGE_MAX } from '../../hooks/use-products-filter';
import { useDebounce } from '@/hooks/use-debounce';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDownIcon, XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const ProductPriceFilter = () => {
	const [filters, setFilters] = useProductsFilters();

	const [range, setRange] = useState<[number, number]>([
		filters.minPrice ?? 0,
		filters.maxPrice ?? PRICE_RANGE_MAX,
	]);
	const debouncedRange = useDebounce(range, 400);
	const [open, setOpen] = useState(false);

	useEffect(() => {
		setFilters({ minPrice: debouncedRange[0], maxPrice: debouncedRange[1], page: 1 });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedRange]);

	// sync back when cleared externally
	useEffect(() => {
		if (filters.minPrice === 0 && filters.maxPrice === PRICE_RANGE_MAX) {
			setRange([0, PRICE_RANGE_MAX]);
		}
	}, [filters.minPrice, filters.maxPrice]);

	const isActive = range[0] > 0 || range[1] < PRICE_RANGE_MAX;

	const clear = (e: React.MouseEvent) => {
		e.stopPropagation();
		setRange([0, PRICE_RANGE_MAX]);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant="outline"
					className={cn(
						'h-8 gap-x-2 px-3 text-sm font-normal transition-colors',
						isActive && 'border-primary/50 bg-primary/5 text-foreground'
					)}
				>
					{isActive ? (
						<>
							<span className="text-sm font-medium">
								${range[0]} – ${range[1]}
								{range[1] === PRICE_RANGE_MAX ? '+' : ''}
							</span>
							<XIcon
								className="size-3.5 text-muted-foreground hover:text-foreground"
								onClick={clear}
							/>
						</>
					) : (
						<>
							<span className="text-muted-foreground">Price</span>
							<ChevronDownIcon className="size-3.5 text-muted-foreground" />
						</>
					)}
				</Button>
			</PopoverTrigger>

			<PopoverContent className="w-72 p-4" align="start">
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<p className="text-sm font-medium">Price range</p>
						{isActive && (
							<button
								onClick={() => setRange([0, PRICE_RANGE_MAX])}
								className="text-xs text-muted-foreground hover:text-foreground"
							>
								Reset
							</button>
						)}
					</div>

					<Slider
						min={0}
						max={PRICE_RANGE_MAX}
						step={1}
						value={range}
						onValueChange={(v) => setRange(v as [number, number])}
						className="w-full"
					/>

					<div className="flex items-center justify-between text-sm">
						<div className="rounded-md border px-2 py-1 text-sm">${range[0]}</div>
						<span className="text-muted-foreground">—</span>
						<div className="rounded-md border px-2 py-1 text-sm">
							${range[1]}
							{range[1] === PRICE_RANGE_MAX ? '+' : ''}
						</div>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
};

export default ProductPriceFilter;
