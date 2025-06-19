'use client';
import CardCategory from './cards/card-category';
import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';
import {
	Carousel,
	CarouselApi,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import { Suspense, useEffect, useState } from 'react';
import { usePOSFilters } from '@/modules/pos/hooks/use-pos-filter';
import { ErrorBoundary } from 'react-error-boundary';
import { Skeleton } from '@/components/ui/skeleton';

const CategoryList = () => {
	return (
		<>
			<Suspense fallback={<p>Loading...</p>}>
				<ErrorBoundary fallback={<p>Error...</p>}>
					<CategoryListSuspense />
				</ErrorBoundary>
			</Suspense>
		</>
	);
};

export default CategoryList;

const CategoryListSuspense = () => {
	const [carouselApi, setCarouselApi] = useState<CarouselApi>();
	const [carouselCurrentIndex, setCarouselCurrentIndex] = useState(0);
	const [carouselCount, setCarouselCount] = useState(0);

	const [filters, setFilters] = usePOSFilters();
	const trpc = useTRPC();
	const { data, isLoading } = useQuery(
		trpc.categories.getMany.queryOptions({
			pageSize: 100,
			search: '',
		})
	);

	useEffect(() => {
		if (!carouselApi) {
			return;
		}
		setCarouselCount(carouselApi.scrollSnapList().length);
		setCarouselCurrentIndex(carouselApi.selectedScrollSnap() + 1);
		carouselApi.on('select', () => {
			setCarouselCurrentIndex(carouselApi.selectedScrollSnap() + 1);
		});
	}, [carouselApi]);
	return (
		<div className="relative px-0">
			{/* left fade */}
			<div
				className={cn(
					'pointer-events-none absolute top-0 bottom-0 left-12 z-10 w-12 bg-gradient-to-r from-white to-transparent',
					carouselCurrentIndex === 1 && 'hidden'
				)}
			/>
			<Carousel
				setApi={setCarouselApi}
				opts={{
					align: 'start',
					dragFree: true,
				}}
				className="w-full px-12"
			>
				<CarouselContent className="-ml-3">
					{!isLoading && (
						<CarouselItem className="basis-auto pl-3">
							<CardCategory
								category={{
									id: '',
									name: 'All',
									imageUrl: '',
								}}
								onSelect={(value) => setFilters({ categoryId: value })}
								selectedValue={filters.categoryId ?? ''}
								className="text-center min-h-[38px] min-w-[80px]"
							/>
						</CarouselItem>
					)}
					{isLoading &&
						Array.from({ length: 20 }).map((_, index) => (
							<CarouselItem className="basis-auto pl-3" key={index}>
								<Skeleton className="h-full w-[100px] rounded-full px-3 py-1 text-sm font-semibold">
									&nbsp;
								</Skeleton>
							</CarouselItem>
						))}
					{!isLoading &&
						data?.items.map((category) => (
							<CarouselItem className="basis-auto pl-3" key={category.id}>
								<CardCategory
									key={category.id}
									category={category}
									onSelect={(value) => setFilters({ categoryId: value })}
									selectedValue={filters.categoryId ?? ''}
								/>
							</CarouselItem>
						))}
				</CarouselContent>
				<CarouselPrevious className="left-0 z-20" />
				<CarouselNext className="right-0 z-20" />
			</Carousel>
			{/* right fade */}
			<div
				className={cn(
					'pointer-events-none absolute top-0 right-12 bottom-0 z-10 w-12 bg-gradient-to-l from-white to-transparent',
					carouselCurrentIndex === carouselCount && 'hidden'
				)}
			/>
		</div>
	);
};
