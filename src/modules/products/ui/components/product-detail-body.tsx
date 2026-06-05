import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, HashIcon, TagIcon, PencilIcon, TrashIcon } from 'lucide-react';
import ProductImageGallery from '@/components/product-image-gallery';
import { useCurrency } from '@/modules/company/hooks/use-currency';

interface ProductDetailData {
	name: string;
	isAvailable: boolean;
	categories?: { name: string; imageUrl?: string | null } | null;
	price: number | string;
	description?: string | null;
	slug: string;
	createdAt: Date | string;
	updatedAt: Date | string;
	imageUrl: string;
	images?: unknown;
}

interface Props {
	data: ProductDetailData;
	taxRate: number;
	serviceRate: number;
	isRemoving: boolean;
	onEdit: () => void;
	onRemove: () => void;
}

export const ProductDetailBody = ({
	data,
	taxRate,
	serviceRate,
	isRemoving,
	onEdit,
	onRemove,
}: Props) => {
	const { format: formatCurrency } = useCurrency();
	const basePrice = Number(data.price);
	const tax = basePrice * (taxRate / 100);
	const service = basePrice * (serviceRate / 100);
	const finalPrice = basePrice + tax + service;

	return (
		<div className="px-4 py-6 md:px-8">
			<div className="grid gap-8 lg:grid-cols-12">
				{/* gallery */}
				<div className="lg:col-span-5">
					<ProductImageGallery
						mainImage={data.imageUrl}
						images={data.images as string[] | null}
						alt={data.name}
					/>
				</div>

				{/* info */}
				<div className="flex flex-col gap-y-6 lg:col-span-7">
					{/* name + status */}
					<div>
						<div className="flex flex-wrap items-start justify-between gap-3">
							<h1 className="text-2xl leading-tight font-bold tracking-tight md:text-3xl">
								{data.name}
							</h1>
							{data.isAvailable ? (
								<Badge className="mt-1 shrink-0 border-green-200 bg-green-50 text-green-700 hover:bg-green-50">
									● Available
								</Badge>
							) : (
								<Badge
									variant="outline"
									className="mt-1 shrink-0 text-muted-foreground"
								>
									● Unavailable
								</Badge>
							)}
						</div>
						{data.categories && (
							<div className="mt-2 flex items-center gap-x-1.5">
								{data.categories.imageUrl && (
									<div className="relative size-4 overflow-hidden rounded-sm">
										<Image
											src={data.categories.imageUrl}
											alt={data.categories.name}
											fill
											sizes="16px"
											className="object-cover"
										/>
									</div>
								)}
								<span className="text-sm text-muted-foreground capitalize">
									{data.categories.name}
								</span>
							</div>
						)}
					</div>

					{/* price */}
					<div className="flex flex-col gap-y-1">
						<div className="flex items-baseline gap-x-2">
							<span className="text-4xl font-extrabold tracking-tight">
								{formatCurrency(finalPrice)}
							</span>
							<span className="text-sm text-muted-foreground">per item</span>
						</div>
						{(taxRate > 0 || serviceRate > 0) && (
							<div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
								<span>{formatCurrency(basePrice)} base</span>
								{taxRate > 0 && (
									<span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600">
										+{taxRate}% tax = {formatCurrency(tax)}
									</span>
								)}
								{serviceRate > 0 && (
									<span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
										+{serviceRate}% service = {formatCurrency(service)}
									</span>
								)}
							</div>
						)}
					</div>

					<Separator />

					{/* description */}
					{data.description ? (
						<div>
							<p className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
								Description
							</p>
							<div
								className="prose prose-sm max-w-none text-foreground/80 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
								dangerouslySetInnerHTML={{ __html: data.description }}
							/>
						</div>
					) : (
						<p className="text-sm text-muted-foreground/50 italic">
							No description provided.
						</p>
					)}

					<Separator />

					{/* meta */}
					<dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
						<div>
							<dt className="mb-1 flex items-center gap-x-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
								<HashIcon className="size-3" /> Slug
							</dt>
							<dd className="inline-block rounded-md bg-muted px-2 py-1 font-mono text-sm">
								{data.slug}
							</dd>
						</div>
						<div>
							<dt className="mb-1 flex items-center gap-x-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
								<TagIcon className="size-3" /> Category
							</dt>
							<dd className="text-sm font-medium capitalize">
								{data.categories?.name ?? '—'}
							</dd>
						</div>
						<div>
							<dt className="mb-1 flex items-center gap-x-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
								<CalendarIcon className="size-3" /> Created
							</dt>
							<dd className="text-sm">
								{new Date(data.createdAt).toLocaleDateString('en-US', {
									year: 'numeric',
									month: 'long',
									day: 'numeric',
								})}
							</dd>
						</div>
						<div>
							<dt className="mb-1 flex items-center gap-x-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
								<CalendarIcon className="size-3" /> Last updated
							</dt>
							<dd className="text-sm">
								{new Date(data.updatedAt).toLocaleDateString('en-US', {
									year: 'numeric',
									month: 'long',
									day: 'numeric',
								})}
							</dd>
						</div>
					</dl>

					<Separator />

					{/* actions */}
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
						<Button onClick={onEdit} className="w-full gap-x-2 sm:w-auto">
							<PencilIcon className="size-4" /> Edit product
						</Button>
						<Button
							variant="outline"
							onClick={onRemove}
							disabled={isRemoving}
							className="w-full gap-x-2 text-destructive hover:text-destructive sm:w-auto"
						>
							<TrashIcon className="size-4" /> Delete
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};
