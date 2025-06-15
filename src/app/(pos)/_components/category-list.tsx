'use client';
import CardCategory from './cards/card-category';
import { useProductsFilters } from '@/modules/products/hooks/use-products-filter';
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
import { useEffect, useState } from 'react';
import { CategoriesGetMany } from '@/modules/productCategories/types';
import { usePOSFilters } from '@/modules/pos/hooks/use-pos-filter';



const CategoryList = () => {
	const [carouselApi, setCarouselApi] = useState<CarouselApi>();
	const [carouselCurrentIndex, setCarouselCurrentIndex] = useState(0);
	const [carouselCount, setCarouselCount] = useState(0);

	const [filters, setFilters] = usePOSFilters();
	const trpc = useTRPC();
	const { data } = useQuery(
		trpc.categories.getMany.queryOptions({
			pageSize: 100,
			search: '',
		})
	);

	useEffect(() => {
		if(!carouselApi){
			return
		}
		setCarouselCount(carouselApi.scrollSnapList().length)
		setCarouselCurrentIndex(carouselApi.selectedScrollSnap()+1)
		carouselApi.on("select",()=>{
			setCarouselCurrentIndex(carouselApi.selectedScrollSnap()+1)
		})

	},[carouselApi])
	return (
		<div className="relative px-0">
			{/* left fade */}
			<div
				className={cn(
					'absolute left-12 top-0 bottom-0 w-12 z-10 bg-gradient-to-r from-white to-transparent pointer-events-none', 
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
				<CarouselContent className='-ml-3'>
					{data?.items.map((category) => (
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
				<CarouselPrevious className='left-0 z-20' />
				<CarouselNext className='right-0 z-20' />
			</Carousel>
			{/* right fade */}
			<div
				className={cn(
					'absolute right-12 top-0 bottom-0 w-12 z-10 bg-gradient-to-l from-white to-transparent pointer-events-none', 
					carouselCurrentIndex === carouselCount && 'hidden'
				)}
			/>
		</div>
	);
};

export default CategoryList;
