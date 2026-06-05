import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import AnalyticsView from '@/modules/analytics/ui/views/analytics-view';
import { AnalyticsViewLoading } from '@/modules/analytics/ui/views/analytics-view-loading';
import { getQueryClient, trpc } from '@/trpc/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';

const DashboardPage = async () => {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) redirect('/sign-in');

	const queryClient = getQueryClient();
	void queryClient.prefetchQuery(trpc.analytics.summary.queryOptions());
	void queryClient.prefetchQuery(trpc.analytics.revenueByDay.queryOptions());
	void queryClient.prefetchQuery(trpc.analytics.topProducts.queryOptions());
	void queryClient.prefetchQuery(trpc.analytics.paymentMethodBreakdown.queryOptions());
	void queryClient.prefetchQuery(trpc.analytics.orderStatusBreakdown.queryOptions());
	void queryClient.prefetchQuery(trpc.analytics.recentOrders.queryOptions());

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<Suspense fallback={<AnalyticsViewLoading />}>
				<AnalyticsView />
			</Suspense>
		</HydrationBoundary>
	);
};

export default DashboardPage;
