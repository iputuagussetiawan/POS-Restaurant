import HeaderPOS from '@/modules/pos/ui/components/header';
import FooterPOS from '@/modules/pos/ui/components/footer';
import PosView, { POSViewError, POSViewLoading } from '@/modules/pos/ui/views/pos-view';
import { getQueryClient, trpc } from '@/trpc/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import React, { Suspense } from 'react';
import { loadSearchParams } from '@/modules/pos/params';
import type { SearchParams } from 'nuqs';

interface Props {
	searchParams: Promise<SearchParams>;
}

const POSPage = async ({ searchParams }: Props) => {
	const filters = await loadSearchParams(searchParams);
	const queryClient = getQueryClient();
	void queryClient.prefetchQuery(
		trpc.products.getMany.queryOptions({
			...filters,
		})
	);
	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<HeaderPOS />
			<Suspense fallback={<POSViewLoading />}>
				<ErrorBoundary fallback={<POSViewError />}>
					<PosView />
				</ErrorBoundary>
			</Suspense>
			<FooterPOS />
		</HydrationBoundary>
	);
};

export default POSPage;
