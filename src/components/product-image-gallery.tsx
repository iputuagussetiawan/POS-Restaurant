'use client';

import { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductImageGalleryProps {
	mainImage: string;
	images?: string[] | null;
	alt: string;
}

const ProductImageGallery = ({ mainImage, images, alt }: ProductImageGalleryProps) => {
	// combine main image + extra images, deduplicate
	const allImages = [
		mainImage,
		...(images ?? []).filter((img) => img && img !== mainImage),
	].filter(Boolean);

	const [selectedIndex, setSelectedIndex] = useState(0);
	const [mainRef, mainApi] = useEmblaCarousel({ loop: false, dragFree: false });
	const [thumbRef, thumbApi] = useEmblaCarousel({
		containScroll: 'keepSnaps',
		dragFree: true,
	});

	const onThumbClick = useCallback(
		(index: number) => {
			if (!mainApi || !thumbApi) return;
			mainApi.scrollTo(index);
		},
		[mainApi, thumbApi]
	);

	const onSelect = useCallback(() => {
		if (!mainApi || !thumbApi) return;
		const index = mainApi.selectedScrollSnap();
		setSelectedIndex(index);
		thumbApi.scrollTo(index);
	}, [mainApi, thumbApi]);

	useEffect(() => {
		if (!mainApi) return;
		onSelect();
		mainApi.on('select', onSelect);
		mainApi.on('reInit', onSelect);
		return () => {
			mainApi.off('select', onSelect);
		};
	}, [mainApi, onSelect]);

	const scrollPrev = useCallback(() => mainApi?.scrollPrev(), [mainApi]);
	const scrollNext = useCallback(() => mainApi?.scrollNext(), [mainApi]);

	if (allImages.length === 1) {
		return (
			<div className="overflow-hidden rounded-xl border bg-white">
				<div className="relative aspect-square w-full">
					<Image
						src={allImages[0]}
						alt={alt}
						fill
						sizes="(max-width: 1024px) 100vw, 33vw"
						className="object-cover"
					/>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-y-2">
			{/* main viewer */}
			<div className="relative overflow-hidden rounded-xl border bg-white">
				<div ref={mainRef} className="overflow-hidden">
					<div className="flex">
						{allImages.map((img, i) => (
							<div key={i} className="relative aspect-square min-w-0 flex-[0_0_100%]">
								<Image
									src={img}
									alt={`${alt} ${i + 1}`}
									fill
									sizes="(max-width: 1024px) 100vw, 33vw"
									className="object-cover"
								/>
							</div>
						))}
					</div>
				</div>

				{/* prev/next */}
				<button
					onClick={scrollPrev}
					className="absolute top-1/2 left-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 shadow-md backdrop-blur-sm transition hover:bg-background disabled:opacity-30"
					disabled={selectedIndex === 0}
				>
					<ChevronLeftIcon className="size-4" />
				</button>
				<button
					onClick={scrollNext}
					className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 shadow-md backdrop-blur-sm transition hover:bg-background disabled:opacity-30"
					disabled={selectedIndex === allImages.length - 1}
				>
					<ChevronRightIcon className="size-4" />
				</button>

				{/* dot counter */}
				<div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-x-1.5">
					{allImages.map((_, i) => (
						<button
							key={i}
							onClick={() => onThumbClick(i)}
							className={cn(
								'size-1.5 rounded-full transition-all',
								i === selectedIndex ? 'scale-125 bg-foreground' : 'bg-foreground/30'
							)}
						/>
					))}
				</div>
			</div>

			{/* thumbnail strip */}
			<div ref={thumbRef} className="overflow-hidden">
				<div className="flex gap-x-2">
					{allImages.map((img, i) => (
						<button
							key={i}
							onClick={() => onThumbClick(i)}
							className={cn(
								'relative size-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all',
								i === selectedIndex
									? 'border-primary opacity-100 shadow-sm'
									: 'border-transparent opacity-50 hover:opacity-80'
							)}
						>
							<Image
								src={img}
								alt={`${alt} thumbnail ${i + 1}`}
								fill
								sizes="64px"
								className="object-cover"
							/>
						</button>
					))}
				</div>
			</div>
		</div>
	);
};

export default ProductImageGallery;
