'use client';

import ErrorState from '@/components/error-state';
import LoadingState from '@/components/loading-state';
import { useTRPC } from '@/trpc/client';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import ProductIdViewHeader from '../components/product-id-view-header';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { UseConfirm } from '@/hooks/use-confirm';
import UpdateProductDialog from '../components/update-product-dialog';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TagIcon, DollarSignIcon, CalendarIcon, HashIcon } from 'lucide-react';

interface Props {
	productId: string;
}

const ProductIdView = ({ productId }: Props) => {
	const [updateProductDialogOpen, setUpdateProductDialogOpen] = useState(false);
	const router = useRouter();
	const queryClient = useQueryClient();
	const trpc = useTRPC();
	const { data } = useSuspenseQuery(trpc.products.getOne.queryOptions({ id: productId }));

	const removeProduct = useMutation(
		trpc.products.remove.mutationOptions({
			onSuccess: async () => {
				await queryClient.invalidateQueries(trpc.products.getMany.queryOptions({}));
				router.push('/products');
			},
			onError: (error) => {
				toast.error(error.message);
			},
		})
	);

	const [RemoveConfirmation, confirmRemove] = UseConfirm(
		'Are you sure?',
		`This will permanently delete "${data.name}".`
	);

	const handleRemoveProduct = async () => {
		const ok = await confirmRemove();
		if (!ok) return;
		await removeProduct.mutateAsync({ id: productId });
	};

	return (
		<>
			<RemoveConfirmation />
			<UpdateProductDialog
				open={updateProductDialogOpen}
				onOpenChange={setUpdateProductDialogOpen}
				initialValues={data}
			/>
			<div className="flex flex-1 flex-col gap-y-4 px-4 py-4 md:px-8">
				<ProductIdViewHeader
					productId={productId}
					productName={data.name}
					onEdit={() => setUpdateProductDialogOpen(true)}
					onRemove={handleRemoveProduct}
				/>

				<div className="grid gap-4 lg:grid-cols-3">
					{/* left — image */}
					<div className="flex flex-col gap-y-4">
						<div className="overflow-hidden rounded-xl border bg-white">
							<div className="relative aspect-square w-full">
								<Image
									src={data.imageUrl}
									alt={data.name}
									fill
									sizes="(max-width: 1024px) 100vw, 33vw"
									className="object-cover"
								/>
							</div>
						</div>
					</div>

					{/* right — details */}
					<div className="flex flex-col gap-y-4 lg:col-span-2">
						<div className="rounded-xl border bg-white px-6 py-5">
							<div className="flex items-start justify-between gap-4">
								<div>
									<h2 className="text-2xl font-semibold">{data.name}</h2>
									{data.description && (
										<p className="mt-1 text-sm text-muted-foreground">
											{data.description}
										</p>
									)}
								</div>
								{data.isAvailable ? (
									<Badge className="shrink-0 bg-green-100 text-green-700 hover:bg-green-100">
										Available
									</Badge>
								) : (
									<Badge
										variant="secondary"
										className="shrink-0 text-muted-foreground"
									>
										Unavailable
									</Badge>
								)}
							</div>

							<Separator className="my-5" />

							<dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
								<div className="flex flex-col gap-y-1">
									<dt className="flex items-center gap-x-1.5 text-xs font-medium text-muted-foreground">
										<DollarSignIcon className="size-3.5" /> Price
									</dt>
									<dd className="text-xl font-semibold">
										${Number(data.price).toFixed(2)}
									</dd>
								</div>

								<div className="flex flex-col gap-y-1">
									<dt className="flex items-center gap-x-1.5 text-xs font-medium text-muted-foreground">
										<HashIcon className="size-3.5" /> Slug
									</dt>
									<dd className="font-mono text-sm">{data.slug}</dd>
								</div>

								<div className="flex flex-col gap-y-1">
									<dt className="flex items-center gap-x-1.5 text-xs font-medium text-muted-foreground">
										<CalendarIcon className="size-3.5" /> Created
									</dt>
									<dd className="text-sm">
										{new Date(data.createdAt).toLocaleDateString('en-US', {
											year: 'numeric',
											month: 'short',
											day: 'numeric',
										})}
									</dd>
								</div>
							</dl>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default ProductIdView;

export const ProductIdViewLoading = () => (
	<LoadingState title="Loading Product" description="Please wait..." />
);

export const ProductIdViewError = () => (
	<ErrorState title="Error Loading Product" description="Please try again later." />
);
