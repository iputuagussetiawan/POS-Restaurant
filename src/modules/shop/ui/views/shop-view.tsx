'use client';

import { useState, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorState from '@/components/error-state';
import { ShopProductBrowser } from '../components/shop-product-browser';
import { ShopCartSheet } from '../components/shop-cart-sheet';
import ShopHeader from '../components/shop-header';
import { ShopViewLoading } from './shop-view-loading';

const ShopContent = () => {
	const [cartOpen, setCartOpen] = useState(false);

	return (
		<div className="flex min-h-screen flex-col">
			<ShopHeader onCartOpen={() => setCartOpen(true)} />
			<div className="flex flex-1 flex-col bg-gray-50">
				<ShopProductBrowser />
			</div>
			<ShopCartSheet open={cartOpen} onOpenChange={setCartOpen} />
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
