
import CategoriesIdView, { CategoriesIdViewError, CategoriesIdViewLoading } from '@/modules/productCategories/ui/views/categories-id-view';
import { getQueryClient, trpc } from '@/trpc/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

interface Props {
    params: Promise<{ categoryId: string }>;
}
const CategoriesDetailPage = async ({ params }: Props) => {
    const { categoryId } = await params;
    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(
        trpc.categories.getOne.queryOptions({
            id: categoryId,
        })
    );
    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={<CategoriesIdViewLoading />}>
                <ErrorBoundary fallback={<CategoriesIdViewError />}>
                    <CategoriesIdView categoryId={categoryId} />
                </ErrorBoundary>
            </Suspense>
        </HydrationBoundary>
    );
};

export default CategoriesDetailPage;
