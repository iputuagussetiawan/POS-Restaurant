import HeaderPOS from '@/modules/pos/ui/components/header';
import FooterPOS from '@/modules/pos/ui/components/footer';
import CashierHistoryView, {
	CashierHistoryViewLoading,
} from '@/modules/history/ui/views/cashier-history-view';
import { getQueryClient, trpc } from '@/trpc/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

const CashierHistoryPage = async () => {
	const queryClient = getQueryClient();
	void queryClient.prefetchQuery(trpc.history.cashierHistory.queryOptions({ page: 1 }));

	return (
		<div className="flex min-h-screen flex-col bg-muted">
			<HydrationBoundary state={dehydrate(queryClient)}>
				<HeaderPOS />
				<div className="flex flex-1 flex-col">
					<Suspense fallback={<CashierHistoryViewLoading />}>
						<CashierHistoryView />
					</Suspense>
				</div>
				<FooterPOS />
			</HydrationBoundary>
		</div>
	);
};

export default CashierHistoryPage;
