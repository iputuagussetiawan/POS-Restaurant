import { auth } from '@/lib/auth';
import { loadSearchParams } from '@/modules/products/params';
import ProductListHeader from '@/modules/products/ui/components/product-list-header';
import { ProductView, ProductViewError, ProductViewLoading } from '@/modules/products/ui/views/product-view';
import { getQueryClient, trpc } from '@/trpc/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { SearchParams } from 'nuqs';
import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

interface Props {
	searchParams: Promise<SearchParams>;
}

const ProductsPage = async ({ searchParams }: Props) => {
	const filters = await loadSearchParams(searchParams);
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (!session) {
		redirect('/sign-in');
	}

	const queryClient = getQueryClient();
	void queryClient.prefetchQuery(
		trpc.products.getMany.queryOptions({
			...filters,
		})
	);
	return (
		<>
			<ProductListHeader />
			<HydrationBoundary state={dehydrate(queryClient)}>
				<Suspense fallback={<ProductViewLoading />}>
					<ErrorBoundary fallback={<ProductViewError />}>
						<ProductView />
					</ErrorBoundary>
				</Suspense>
			</HydrationBoundary>
		</>
	);
};

export default ProductsPage;
