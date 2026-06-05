'use client';

import { useState, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useTRPC } from '@/trpc/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import ErrorState from '@/components/error-state';
import { useCartStore } from '@/modules/pos/store/use-cart-store';
import { ShopProductBrowser } from '../components/shop-product-browser';
import { ShopCartSheet } from '../components/shop-cart-sheet';
import ShopPaymentModal from '../components/shop-payment-modal';
import ShopHeader from '../components/shop-header';
import { ShopViewLoading } from './shop-view-loading';

const ShopContent = () => {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const [paymentOpen, setPaymentOpen] = useState(false);
	const [cartOpen, setCartOpen] = useState(false);
	const [pendingTotals, setPendingTotals] = useState({
		subtotal: 0,
		tax: 0,
		serviceCharge: 0,
		total: 0,
	});

	const { data: settings } = useQuery(trpc.shop.getSettings.queryOptions());
	const taxRate = Number(settings?.taxRate ?? 0) / 100;
	const serviceRate = Number(settings?.serviceRate ?? 0) / 100;

	const { items } = useCartStore();

	const placeOrder = useMutation(
		trpc.orders.place.mutationOptions({
			onSuccess: () => {
				useCartStore.getState().clearCart();
				queryClient.invalidateQueries({ queryKey: trpc.orders.getMany.queryKey() });
				toast.success('Order placed successfully!');
				setPaymentOpen(false);
				setCartOpen(false);
			},
			onError: (e: { message: string }) => toast.error(e.message),
		})
	);

	const handleCheckout = (totals: {
		subtotal: number;
		tax: number;
		serviceCharge: number;
		total: number;
	}) => {
		setPendingTotals(totals);
		setCartOpen(false);
		setPaymentOpen(true);
	};

	const handleConfirmPayment = ({
		paymentMethod,
		customerName,
		customerId,
		note,
		discountCode,
	}: {
		paymentMethod: 'cash' | 'card' | 'qris' | 'transfer';
		customerName: string;
		customerId?: string;
		note: string;
		discountCode?: string;
	}) => {
		placeOrder.mutate({
			items: items.map(({ product, quantity }) => ({
				productId: product.id,
				name: product.name,
				price: Number(product.price),
				quantity,
			})),
			paymentMethod,
			customerName: customerName || undefined,
			customerId: customerId || undefined,
			note: note || undefined,
			discountCode: discountCode || undefined,
		});
	};

	return (
		<div className="flex min-h-screen flex-col">
			<ShopHeader onCartOpen={() => setCartOpen(true)} />
			<div className="flex flex-1 flex-col bg-gray-50">
				<ShopProductBrowser />
			</div>
			<ShopCartSheet
				taxRate={taxRate}
				serviceRate={serviceRate}
				isPending={placeOrder.isPending}
				onCheckout={handleCheckout}
				open={cartOpen}
				onOpenChange={setCartOpen}
			/>
			<ShopPaymentModal
				open={paymentOpen}
				onClose={() => setPaymentOpen(false)}
				onConfirm={handleConfirmPayment}
				isPending={placeOrder.isPending}
				subtotal={pendingTotals.subtotal}
				tax={pendingTotals.tax}
				taxRate={Math.round(taxRate * 100)}
				serviceCharge={pendingTotals.serviceCharge}
				serviceRate={Math.round(serviceRate * 100)}
				total={pendingTotals.total}
			/>
		</div>
	);
};

const ShopView = () => (
	<ErrorBoundary
		fallback={<ErrorState title="Error loading shop" description="Please try again later." />}
	>
		<Suspense fallback={<ShopViewLoading />}>
			<ShopContent />
		</Suspense>
	</ErrorBoundary>
);

export default ShopView;
