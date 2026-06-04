import KitchenView, { KitchenViewLoading } from '@/modules/kitchen/ui/views/kitchen-view';
import { getQueryClient, trpc } from '@/trpc/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

const KitchenPage = async () => {
	const queryClient = getQueryClient();
	void queryClient.prefetchQuery(
		trpc.orders.getMany.queryOptions({
			page: 1,
			pageSize: 50,
			status: 'pending',
			sortOrder: 'asc',
		})
	);

	return (
		<div className="flex min-h-screen flex-col bg-gray-950">
			<HydrationBoundary state={dehydrate(queryClient)}>
				<Suspense fallback={<KitchenViewLoading />}>
					<KitchenView />
				</Suspense>
			</HydrationBoundary>
		</div>
	);
};

export default KitchenPage;
