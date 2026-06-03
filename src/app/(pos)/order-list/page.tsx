import HeaderPOS from '@/modules/pos/ui/components/header';
import FooterPOS from '@/modules/pos/ui/components/footer';
import OrdersView, { OrdersViewLoading } from '@/modules/orders/ui/views/orders-view';
import { getQueryClient, trpc } from '@/trpc/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import {
	createLoader,
	parseAsInteger,
	parseAsIsoDate,
	parseAsString,
	parseAsStringEnum,
} from 'nuqs/server';
import type { SearchParams } from 'nuqs';

const loadFilters = createLoader({
	page: parseAsInteger.withDefault(1),
	search: parseAsString.withDefault(''),
	status: parseAsStringEnum(['pending', 'processing', 'completed', 'cancelled']),
	date: parseAsIsoDate,
});

interface Props {
	searchParams: Promise<SearchParams>;
}

const OrderListPage = async ({ searchParams }: Props) => {
	const filters = await loadFilters(searchParams);
	const today = new Date();
	const date = filters.date ?? today;

	const queryClient = getQueryClient();
	void queryClient.prefetchQuery(
		trpc.orders.getMany.queryOptions({
			page: filters.page,
			search: filters.search || undefined,
			status: filters.status ?? undefined,
			date: date.toISOString().split('T')[0],
		})
	);

	return (
		<div className="flex min-h-screen flex-col bg-muted">
			<HydrationBoundary state={dehydrate(queryClient)}>
				<HeaderPOS />
				<div className="flex-1">
					<Suspense fallback={<OrdersViewLoading />}>
						<OrdersView />
					</Suspense>
				</div>
				<FooterPOS />
			</HydrationBoundary>
		</div>
	);
};

export default OrderListPage;
