'use client';
import ErrorState from '@/components/error-state';
import LoadingState from '@/components/loading-state';
import { useTRPC } from '@/trpc/client';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import ProductIdViewHeader from '../components/product-id-view-header';
import GenerateAvatar from '@/components/generate-avatar';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { UseConfirm } from '@/hooks/use-confirm';
import UpdateProductDialog from '../components/update-product-dialog';

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
		`This will permanently delete the product.`
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
				<div className="rounded-lg border bg-white">
					<div className="col-span-5 flex flex-col gap-y-5 px-4 py-5">
						<div className="flex items-center gap-x-3">
							<GenerateAvatar
								variant="botttsNeutral"
								seed={data.name}
								className="size-10"
							/>
							<h2 className="text-2xl font-medium">{data.name}</h2>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default ProductIdView;

export const ProductIdViewLoading = () => {
	return <LoadingState title="Loading Product" description="Please wait..." />;
};

export const ProductIdViewError = () => {
	return <ErrorState title="Error Loading Product" description="Please try again later." />;
};
