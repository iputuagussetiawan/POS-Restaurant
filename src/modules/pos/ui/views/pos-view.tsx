'use client';

import React from 'react';
import { CheckCircleIcon } from 'lucide-react';
import PaymentModal from '@/modules/pos/ui/components/payment-modal';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useCurrency } from '@/modules/company/hooks/use-currency';
import { useTRPC } from '@/trpc/client';
import { useCartStore } from '@/modules/pos/store/use-cart-store';
import ErrorState from '@/components/error-state';
import { POSViewLoading } from './pos-view-loading';
import { PosProductBrowser } from '../components/pos-product-browser';
import { PosCart } from '../components/pos-cart';

const PosView = () => {
	const trpc = useTRPC();
	const { format: formatCurrency } = useCurrency();
	const { data: company } = useQuery(trpc.company.get.queryOptions());
	const taxRate = Number(company?.taxRate ?? 10) / 100;
	const serviceRate = Number(company?.serviceRate ?? 0) / 100;

	const { items, clearCart } = useCartStore();
	const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);

	const [paymentOpen, setPaymentOpen] = React.useState(false);
	const [pendingTotals, setPendingTotals] = React.useState({
		subtotal: 0,
		tax: 0,
		serviceCharge: 0,
		total: 0,
	});

	const placeOrder = useMutation(
		trpc.orders.place.mutationOptions({
			onSuccess: () => {
				clearCart();
				setPaymentOpen(false);
				toast.success('Order placed successfully!', {
					description: `${totalQty} item${totalQty !== 1 ? 's' : ''} · ${formatCurrency(pendingTotals.total)}`,
					icon: <CheckCircleIcon className="h-4 w-4 text-green-500" />,
				});
			},
			onError: (err) => {
				toast.error('Failed to place order', { description: err.message });
			},
		})
	);

	const handleCheckout = (totals: {
		subtotal: number;
		tax: number;
		serviceCharge: number;
		total: number;
	}) => {
		setPendingTotals(totals);
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
		<div className="flex h-[calc(100vh-57px)] gap-4 overflow-hidden bg-muted p-4">
			<PosProductBrowser />
			<PosCart
				taxRate={taxRate}
				serviceRate={serviceRate}
				isPending={placeOrder.isPending}
				onCheckout={handleCheckout}
			/>
			<PaymentModal
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

export default PosView;

export const POSViewError = () => (
	<ErrorState title="Error loading POS" description="Please try again later." />
);
