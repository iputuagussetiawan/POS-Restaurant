import { ShopCheckoutView } from '@/modules/shop/ui/views/shop-checkout-view';
import { getQueryClient, trpc } from '@/trpc/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

const CheckoutPage = async () => {
	const queryClient = getQueryClient();
	void queryClient.prefetchQuery(trpc.shop.getSettings.queryOptions());

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<ShopCheckoutView />
		</HydrationBoundary>
	);
};

export default CheckoutPage;
