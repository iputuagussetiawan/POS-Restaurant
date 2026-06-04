'use client';

import ErrorState from '@/components/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { useTRPC } from '@/trpc/client';
import { useMutation, useQueryClient, useSuspenseQuery, useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { UseConfirm } from '@/hooks/use-confirm';
import UpdateProductDialog from '../components/update-product-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
	CalendarIcon,
	HashIcon,
	TagIcon,
	PencilIcon,
	TrashIcon,
	ChevronRightIcon,
	MoreVerticalIcon,
} from 'lucide-react';
import ProductImageGallery from '@/components/product-image-gallery';
import Image from 'next/image';
import { useCurrency } from '@/modules/company/hooks/use-currency';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

interface Props {
	slug: string;
}

const ProductSlugView = ({ slug }: Props) => {
	const [updateOpen, setUpdateOpen] = useState(false);
	const router = useRouter();
	const queryClient = useQueryClient();
	const trpc = useTRPC();

	const { data } = useSuspenseQuery(trpc.products.getBySlug.queryOptions({ slug }));
	const { data: company } = useQuery(trpc.company.get.queryOptions());
	const { format: formatCurrency } = useCurrency();

	const taxRate = Number(company?.taxRate ?? 0);
	const serviceRate = Number(company?.serviceRate ?? 0);
	const basePrice = Number(data.price);
	const tax = basePrice * (taxRate / 100);
	const service = basePrice * (serviceRate / 100);
	const finalPrice = basePrice + tax + service;

	const removeProduct = useMutation(
		trpc.products.remove.mutationOptions({
			onSuccess: async () => {
				await queryClient.invalidateQueries(trpc.products.getMany.queryOptions({}));
				router.push('/admin/products');
			},
			onError: (e) => toast.error(e.message),
		})
	);

	const [RemoveConfirmation, confirmRemove] = UseConfirm(
		'Delete product?',
		`"${data.name}" will be permanently removed.`
	);

	const handleRemove = async () => {
		const ok = await confirmRemove();
		if (!ok) return;
		await removeProduct.mutateAsync({ id: data.id });
	};

	return (
		<>
			<RemoveConfirmation />
			<UpdateProductDialog
				open={updateOpen}
				onOpenChange={setUpdateOpen}
				initialValues={data}
			/>

			<div className="flex flex-col">
				{/* breadcrumb / top bar */}
				<div className="border-b bg-background px-4 py-4 md:px-8">
					<div className="flex items-center justify-between">
						<Breadcrumb>
							<BreadcrumbList>
								<BreadcrumbItem>
									<BreadcrumbLink
										asChild
										className="text-sm font-medium text-muted-foreground"
									>
										<Link href="/admin/products">My Products</Link>
									</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator className="[&>svg:size-4] text-sm font-medium text-foreground">
									<ChevronRightIcon />
								</BreadcrumbSeparator>
								<BreadcrumbItem>
									<BreadcrumbLink
										asChild
										className="text-sm font-medium text-foreground"
									>
										<Link href={`/admin/products/${slug}`}>{data.name}</Link>
									</BreadcrumbLink>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>

						<DropdownMenu modal={false}>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="sm">
									<MoreVerticalIcon className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem onClick={() => setUpdateOpen(true)}>
									<PencilIcon className="mr-2 h-4 w-4" /> Edit
								</DropdownMenuItem>
								<DropdownMenuItem onClick={handleRemove}>
									<TrashIcon className="mr-2 h-4 w-4" /> Delete
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>

				{/* body */}
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

							{/* meta grid */}
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
								<Button
									onClick={() => setUpdateOpen(true)}
									className="w-full gap-x-2 sm:w-auto"
								>
									<PencilIcon className="size-4" /> Edit product
								</Button>
								<Button
									variant="outline"
									onClick={handleRemove}
									disabled={removeProduct.isPending}
									className="w-full gap-x-2 text-destructive hover:text-destructive sm:w-auto"
								>
									<TrashIcon className="size-4" /> Delete
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default ProductSlugView;

export const ProductSlugViewLoading = () => (
	<div className="flex flex-col">
		<div className="border-b bg-background px-4 py-4 md:px-8">
			<Skeleton className="h-6 w-64" />
		</div>
		<div className="px-4 py-6 md:px-8">
			<div className="grid gap-8 lg:grid-cols-12">
				<div className="flex flex-col gap-y-2 lg:col-span-5">
					<Skeleton className="aspect-square w-full rounded-xl" />
					<div className="flex flex-wrap gap-2">
						{Array.from({ length: 5 }).map((_, i) => (
							<Skeleton key={i} className="size-16 rounded-lg" />
						))}
					</div>
				</div>
				<div className="flex flex-col gap-y-5 lg:col-span-7">
					<div className="flex flex-col gap-y-2">
						<Skeleton className="h-8 w-3/4" />
						<Skeleton className="h-4 w-24" />
					</div>
					<Skeleton className="h-10 w-32" />
					<Skeleton className="h-px w-full" />
					<div className="flex flex-col gap-y-2">
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-5/6" />
						<Skeleton className="h-4 w-4/6" />
					</div>
					<Skeleton className="h-px w-full" />
					<div className="grid grid-cols-2 gap-4">
						{Array.from({ length: 4 }).map((_, i) => (
							<Skeleton key={i} className="h-12 rounded-md" />
						))}
					</div>
				</div>
			</div>
		</div>
	</div>
);

export const ProductSlugViewError = () => (
	<ErrorState
		title="Product Not Found"
		description="This product does not exist or has been removed."
	/>
);
