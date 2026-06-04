import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getQueryClient, trpc } from '@/trpc/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { SearchParams } from 'nuqs';
import { loadDiscountSearchParams } from '@/modules/discounts/params';
import DiscountsListHeader from '@/modules/discounts/ui/components/discounts-list-header';
import { DiscountsView, DiscountsViewLoading } from '@/modules/discounts/ui/views/discounts-view';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

interface Props {
	searchParams: Promise<SearchParams>;
}

const DiscountsPage = async ({ searchParams }: Props) => {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) redirect('/sign-in');

	const filters = await loadDiscountSearchParams(searchParams);
	const queryClient = getQueryClient();
	void queryClient.prefetchQuery(trpc.discounts.getMany.queryOptions({ ...filters }));

	return (
		<>
			<DiscountsListHeader />
			<HydrationBoundary state={dehydrate(queryClient)}>
				<Suspense fallback={<DiscountsViewLoading />}>
					<DiscountsView />
				</Suspense>
			</HydrationBoundary>
		</>
	);
};

export default DiscountsPage;
