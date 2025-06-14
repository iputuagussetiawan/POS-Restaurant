'use client';
import CardCategory from './cards/card-category';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useProductsFilters } from '@/modules/products/hooks/use-products-filter';
import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from '@/components/ui/carousel';

const CategoryList = () => {
	const [filters, setFilters] = useProductsFilters();
	const trpc = useTRPC();
	const { data } = useQuery(
		trpc.categories.getMany.queryOptions({
			pageSize: 100,
			search: '',
		})
	);
	return (
		<div className="px-12">
			<Carousel
				opts={{
					align: 'start',
					dragFree: true,
				}}
				className="w-full"
			>
				<CarouselContent>
					{data?.items.map((category) => (
						<CarouselItem className="basis-auto pl-3" key={category.id}>
							<CardCategory key={category.id} category={category} />
						</CarouselItem>
					))}
				</CarouselContent>
				<CarouselPrevious />
				<CarouselNext />
			</Carousel>
		</div>
	);
};

export default CategoryList;
