import ProductIdView, {
	ProductIdViewError,
	ProductIdViewLoading,
} from '@/modules/products/ui/views/product-id-view';
import { getQueryClient, trpc } from '@/trpc/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

interface Props {
	params: Promise<{ productId: string }>;
}

const ProductDetailPage = async ({ params }: Props) => {
	const { productId } = await params;
	const queryClient = getQueryClient();
	void queryClient.prefetchQuery(
		trpc.products.getOne.queryOptions({
			id: productId,
		})
	);
	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<Suspense fallback={<ProductIdViewLoading />}>
				<ErrorBoundary fallback={<ProductIdViewError />}>
					<ProductIdView productId={productId} />
				</ErrorBoundary>
			</Suspense>
		</HydrationBoundary>
	);
};

export default ProductDetailPage;
