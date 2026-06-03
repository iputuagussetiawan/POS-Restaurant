'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import { ChevronLeftIcon, ChevronRightIcon, ZoomInIcon, XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';

interface ProductImageGalleryProps {
	mainImage: string;
	images?: string[] | null;
	alt: string;
}

/* ── Lightbox ────────────────────────────────────────────── */
const Lightbox = ({
	images,
	startIndex,
	alt,
	onClose,
}: {
	images: string[];
	startIndex: number;
	alt: string;
	onClose: () => void;
}) => {
	const [index, setIndex] = useState(startIndex);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
			if (e.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, images.length - 1));
			if (e.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0));
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [images.length, onClose]);

	return createPortal(
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
			onClick={onClose}
		>
			{/* close */}
			<button
				onClick={onClose}
				className="absolute top-4 right-4 flex size-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
			>
				<XIcon className="size-5" />
			</button>

			{/* counter */}
			<span className="absolute top-4 left-1/2 -translate-x-1/2 text-sm text-white/70">
				{index + 1} / {images.length}
			</span>

			{/* main image */}
			<div
				className="relative aspect-square max-h-[85vh] w-full max-w-[85vw]"
				onClick={(e) => e.stopPropagation()}
			>
				<Image
					src={images[index]}
					alt={`${alt} ${index + 1}`}
					fill
					sizes="85vw"
					className="object-contain"
					priority
				/>
			</div>

			{/* prev */}
			{index > 0 && (
				<button
					onClick={(e) => {
						e.stopPropagation();
						setIndex((i) => i - 1);
					}}
					className="absolute top-1/2 left-4 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
				>
					<ChevronLeftIcon className="size-5" />
				</button>
			)}

			{/* next */}
			{index < images.length - 1 && (
				<button
					onClick={(e) => {
						e.stopPropagation();
						setIndex((i) => i + 1);
					}}
					className="absolute top-1/2 right-4 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
				>
					<ChevronRightIcon className="size-5" />
				</button>
			)}

			{/* thumbnail strip */}
			{images.length > 1 && (
				<div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-x-2">
					{images.map((img, i) => (
						<button
							key={i}
							onClick={(e) => {
								e.stopPropagation();
								setIndex(i);
							}}
							className={cn(
								'relative size-12 shrink-0 overflow-hidden rounded-md border-2 transition-all',
								i === index
									? 'border-white opacity-100'
									: 'border-transparent opacity-40 hover:opacity-70'
							)}
						>
							<Image
								src={img}
								alt={`thumb ${i + 1}`}
								fill
								sizes="48px"
								className="object-cover"
							/>
						</button>
					))}
				</div>
			)}
		</div>,
		document.body
	);
};

/* ── Main Gallery ────────────────────────────────────────── */
const ProductImageGallery = ({ mainImage, images, alt }: ProductImageGalleryProps) => {
	const allImages = [
		mainImage,
		...(images ?? []).filter((img) => img && img !== mainImage),
	].filter(Boolean);

	const [selectedIndex, setSelectedIndex] = useState(0);
	const [lightboxOpen, setLightboxOpen] = useState(false);
	const [zoom, setZoom] = useState(false);
	const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
	const imageRef = useRef<HTMLDivElement>(null);

	const [mainRef, mainApi] = useEmblaCarousel({ loop: false });
	const [thumbRef, thumbApi] = useEmblaCarousel({ containScroll: 'keepSnaps', dragFree: true });

	const onThumbClick = useCallback(
		(index: number) => {
			mainApi?.scrollTo(index);
		},
		[mainApi]
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

	const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
		if (!imageRef.current) return;
		const { left, top, width, height } = imageRef.current.getBoundingClientRect();
		const x = ((e.clientX - left) / width) * 100;
		const y = ((e.clientY - top) / height) * 100;
		setZoomPos({ x, y });
	}, []);

	const scrollPrev = useCallback(() => mainApi?.scrollPrev(), [mainApi]);
	const scrollNext = useCallback(() => mainApi?.scrollNext(), [mainApi]);

	if (allImages.length === 1) {
		return (
			<>
				{lightboxOpen && (
					<Lightbox
						images={allImages}
						startIndex={0}
						alt={alt}
						onClose={() => setLightboxOpen(false)}
					/>
				)}
				<div className="group relative overflow-hidden rounded-xl border bg-white">
					<div
						ref={imageRef}
						className={cn(
							'relative aspect-square w-full cursor-zoom-in overflow-hidden',
							zoom && 'cursor-zoom-out'
						)}
						onMouseEnter={() => setZoom(true)}
						onMouseLeave={() => setZoom(false)}
						onMouseMove={handleMouseMove}
						onClick={() => setLightboxOpen(true)}
					>
						<Image
							src={allImages[0]}
							alt={alt}
							fill
							sizes="(max-width: 1024px) 100vw, 40vw"
							className={cn(
								'object-cover transition-transform duration-200',
								zoom && 'scale-150'
							)}
							style={
								zoom
									? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }
									: undefined
							}
						/>
					</div>
					<button
						onClick={() => setLightboxOpen(true)}
						className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full bg-background/80 opacity-0 shadow-md backdrop-blur-sm transition group-hover:opacity-100"
					>
						<ZoomInIcon className="size-4" />
					</button>
				</div>
			</>
		);
	}

	return (
		<>
			{lightboxOpen && (
				<Lightbox
					images={allImages}
					startIndex={selectedIndex}
					alt={alt}
					onClose={() => setLightboxOpen(false)}
				/>
			)}

			<div className="flex flex-col gap-y-2">
				{/* main viewer */}
				<div className="group relative overflow-hidden rounded-xl border bg-white">
					<div ref={mainRef} className="overflow-hidden">
						<div className="flex">
							{allImages.map((img, i) => (
								<div
									key={i}
									ref={i === selectedIndex ? imageRef : undefined}
									className={cn(
										'relative aspect-square min-w-0 flex-[0_0_100%] cursor-zoom-in overflow-hidden',
										zoom && i === selectedIndex && 'cursor-zoom-out'
									)}
									onMouseEnter={() => setZoom(true)}
									onMouseLeave={() => setZoom(false)}
									onMouseMove={handleMouseMove}
									onClick={() => setLightboxOpen(true)}
								>
									<Image
										src={img}
										alt={`${alt} ${i + 1}`}
										fill
										sizes="(max-width: 1024px) 100vw, 40vw"
										className={cn(
											'object-cover transition-transform duration-200',
											zoom && i === selectedIndex && 'scale-150'
										)}
										style={
											zoom && i === selectedIndex
												? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }
												: undefined
										}
									/>
								</div>
							))}
						</div>
					</div>

					{/* zoom icon */}
					<button
						onClick={() => setLightboxOpen(true)}
						className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full bg-background/80 opacity-0 shadow-md backdrop-blur-sm transition group-hover:opacity-100"
					>
						<ZoomInIcon className="size-4" />
					</button>

					{/* prev/next */}
					<button
						onClick={scrollPrev}
						disabled={selectedIndex === 0}
						className="absolute top-1/2 left-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 shadow-md backdrop-blur-sm transition hover:bg-background disabled:opacity-30"
					>
						<ChevronLeftIcon className="size-4" />
					</button>
					<button
						onClick={scrollNext}
						disabled={selectedIndex === allImages.length - 1}
						className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 shadow-md backdrop-blur-sm transition hover:bg-background disabled:opacity-30"
					>
						<ChevronRightIcon className="size-4" />
					</button>

					{/* dots */}
					<div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-x-1.5">
						{allImages.map((_, i) => (
							<button
								key={i}
								onClick={() => onThumbClick(i)}
								className={cn(
									'size-1.5 rounded-full transition-all',
									i === selectedIndex
										? 'scale-125 bg-foreground'
										: 'bg-foreground/30'
								)}
							/>
						))}
					</div>
				</div>

				{/* thumbnails */}
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
		</>
	);
};

export default ProductImageGallery;
