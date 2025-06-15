import HeaderPOS from '../_components/header';
import FooterPOS from '../_components/footer';
import PosView from '@/modules/pos/ui/views/pos-view';
import { getQueryClient, trpc } from '@/trpc/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import React, { Suspense } from 'react';
import { loadSearchParams } from '@/modules/pos/params';
import type { SearchParams } from 'nuqs';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

interface Props {
	searchParams: Promise<SearchParams>;
}
const POSPage = async ({ searchParams }: Props) => {
	const session = await auth.api.getSession({
			headers: await headers(),
		});
		if (!session) {
			redirect('/sign-in');
		}
	const filters = await loadSearchParams(searchParams);
	const queryClient = getQueryClient();
	void queryClient.prefetchQuery(
		trpc.products.getMany.queryOptions({
			...filters,
		})
	);
	return (
		<>
			<HydrationBoundary state={dehydrate(queryClient)}>
				<Suspense fallback={<p>Loading...</p>}>
					<ErrorBoundary fallback={<p>Error</p>}>
						<HeaderPOS />
						<PosView />
						<FooterPOS />
					</ErrorBoundary>
				</Suspense>
			</HydrationBoundary>
		</>
	);
};

export default POSPage;
