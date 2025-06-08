
import { getQueryClient, trpc } from '@/trpc/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { SearchParams } from 'nuqs';
import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary'
import { CategoriesView, CategoriesViewError, CategoriesViewLoading } from '@/modules/productCategories/ui/views/categories-view';
import { loadSearchParams } from '@/modules/products/params';
import { auth } from '@/lib/auth';
import CategoriesListHeader from '@/modules/productCategories/ui/components/categories-list-header';

interface Props {
    searchParams: Promise<SearchParams>;
}
const CategoriesPage =async ({ searchParams }: Props) => {
    const filters = await loadSearchParams(searchParams);
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        if (!session) {
            redirect('/sign-in');
        }
    
        const queryClient = getQueryClient();
        void queryClient.prefetchQuery(
            trpc.categories.getMany.queryOptions({
                ...filters,
            })
        );
	return (
		<>
			<CategoriesListHeader />
			<HydrationBoundary state={dehydrate(queryClient)}>
				<Suspense fallback={<CategoriesViewLoading />}>
					<ErrorBoundary fallback={<CategoriesViewError />}>
						<CategoriesView />
					</ErrorBoundary>
				</Suspense>
			</HydrationBoundary>
		</>
	);
};

export default CategoriesPage;
