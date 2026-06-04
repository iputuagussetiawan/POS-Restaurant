import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import HistoryView, { HistoryViewLoading } from '@/modules/history/ui/views/history-view';
import { getQueryClient, trpc } from '@/trpc/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';

const HistoryPage = async () => {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) redirect('/sign-in');

	const queryClient = getQueryClient();
	void queryClient.prefetchQuery(trpc.history.getMany.queryOptions({ page: 1, pageSize: 15 }));
	void queryClient.prefetchQuery(trpc.history.summary.queryOptions({}));

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<Suspense fallback={<HistoryViewLoading />}>
				<HistoryView />
			</Suspense>
		</HydrationBoundary>
	);
};

export default HistoryPage;
