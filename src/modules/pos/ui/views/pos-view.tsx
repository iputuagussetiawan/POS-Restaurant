'use client';
import React from 'react';
import Image from 'next/image';
import { MinusIcon, PlusIcon, ShoppingCartIcon, TrashIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import ProductSearch from '@/modules/pos/ui/components/product-search';
import CategoryList from '@/modules/pos/ui/components/category-list';
import ProductList from '@/modules/pos/ui/components/product-list';
import PosPagination from '@/modules/pos/ui/components/pos-pagination';
import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { usePOSFilters } from '../../hooks/use-pos-filter';
import EmptyState from '@/components/empty-state';
import ErrorState from '@/components/error-state';
import { useCartStore } from '@/modules/pos/store/use-cart-store';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const TAX_RATE = 0.1;

function formatUSD(amount: number) {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 2,
	}).format(amount);
}

const PosView = () => {
	const trpc = useTRPC();
	const [filters, setFilters] = usePOSFilters();
	const { data } = useSuspenseQuery(
		trpc.products.getMany.queryOptions({
			search: filters.search,
			page: filters.page,
			categorySlugs: filters.categorySlug ? [filters.categorySlug] : undefined,
		})
	);

	const { items, removeItem, updateQuantity, clearCart } = useCartStore();
	const subtotal = items.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0);
	const tax = subtotal * TAX_RATE;
	const total = subtotal + tax;
	const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);

	return (
		<div className="flex h-[calc(100vh-57px)] gap-4 overflow-hidden bg-muted p-4">
			{/* Left: product browser */}
			<div className="flex min-h-0 flex-1 flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
				{/* Search + category + count inline */}
				<div className="flex items-center gap-3">
					<div className="flex-1">
						<ProductSearch />
					</div>
					<CategoryList />
					<span className="shrink-0 text-xs text-gray-400">
						{data.total} item{data.total !== 1 ? 's' : ''} found
					</span>
				</div>

				<ScrollArea className="min-h-0 flex-1">
					<div className="px-1 pt-1 pb-1">
						<ProductList data={data.items} />
						{data.items.length === 0 && (
							<EmptyState
								title="No Products Found"
								description="Try a different search or category"
							/>
						)}
					</div>
				</ScrollArea>

				{data.items.length !== 0 && data.totalPages > 1 && (
					<div className="border-t pt-3">
						<PosPagination
							page={filters.page}
							totalPages={data.totalPages}
							onPageChange={(page) => setFilters({ page })}
						/>
					</div>
				)}
			</div>

			{/* Right: cart */}
			<div className="flex w-[320px] shrink-0 flex-col overflow-hidden rounded-2xl bg-gray-900 shadow-lg">
				{/* Cart header */}
				<div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4">
					<div className="flex items-center gap-2">
						<ShoppingCartIcon className="h-5 w-5 text-green-400" />
						<h3 className="text-base font-semibold text-white">Current Order</h3>
						{totalQty > 0 && (
							<Badge className="bg-green-600 px-2 py-0.5 text-xs text-white">
								{totalQty}
							</Badge>
						)}
					</div>
					{items.length > 0 && (
						<button
							onClick={clearCart}
							className="text-xs text-red-400 transition-colors hover:text-red-300"
						>
							Clear all
						</button>
					)}
				</div>

				{/* Cart items — scrollable, takes all remaining space */}
				<ScrollArea className="min-h-0 flex-1">
					<div className="px-4 py-3">
						{items.length === 0 ? (
							<div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
								<ShoppingCartIcon className="h-10 w-10 text-white/20" />
								<p className="text-sm text-white/40">Cart is empty</p>
								<p className="text-xs text-white/25">Click a product to add it</p>
							</div>
						) : (
							<div className="flex flex-col gap-2">
								{items.map(({ product, quantity }) => (
									<div
										key={product.id}
										className="flex h-[72px] items-center gap-3 rounded-xl bg-white/8 px-3 transition-colors hover:bg-white/12"
									>
										{/* Fixed image */}
										<div className="relative h-[48px] w-[48px] shrink-0 overflow-hidden rounded-lg">
											<Image
												className="object-cover"
												src={product.imageUrl}
												alt={product.name}
												fill
												sizes="48px"
											/>
										</div>

										{/* Info */}
										<div className="flex min-w-0 flex-1 flex-col gap-0.5">
											<p className="truncate text-xs leading-tight font-semibold text-white">
												{product.name}
											</p>
											<p className="text-xs font-bold text-green-400">
												{formatUSD(Number(product.price))}
											</p>
											{/* qty controls */}
											<div className="mt-1 flex items-center gap-1.5">
												<button
													onClick={() =>
														updateQuantity(product.id, quantity - 1)
													}
													className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
												>
													<MinusIcon className="h-2.5 w-2.5" />
												</button>
												<span className="w-4 text-center text-xs font-bold text-white">
													{quantity}
												</span>
												<button
													onClick={() =>
														updateQuantity(product.id, quantity + 1)
													}
													className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
												>
													<PlusIcon className="h-2.5 w-2.5" />
												</button>
												<span className="ml-auto text-xs text-white/40">
													{formatUSD(Number(product.price) * quantity)}
												</span>
											</div>
										</div>

										{/* Remove */}
										<button
											onClick={() => removeItem(product.id)}
											className="shrink-0 text-white/30 transition-colors hover:text-red-400"
										>
											<TrashIcon className="h-3.5 w-3.5" />
										</button>
									</div>
								))}
							</div>
						)}
					</div>
				</ScrollArea>

				{/* Payment summary */}
				<div className="shrink-0 border-t border-white/10 bg-black/20 px-5 py-4">
					<h4 className="mb-3 text-xs font-semibold tracking-wider text-white/50 uppercase">
						Payment Summary
					</h4>
					<div className="space-y-2 text-sm">
						<div className="flex justify-between text-white/60">
							<span>Subtotal</span>
							<span>{formatUSD(subtotal)}</span>
						</div>
						<div className="flex justify-between text-white/60">
							<span>Tax (10%)</span>
							<span>{formatUSD(tax)}</span>
						</div>
					</div>
					<Separator className="my-3 bg-white/10" />
					<div className="flex justify-between text-base font-bold">
						<span className="text-white">Total</span>
						<span className="text-green-400">{formatUSD(total)}</span>
					</div>
					<Button
						className="mt-4 w-full bg-green-600 font-semibold text-white transition-colors hover:bg-green-500"
						disabled={items.length === 0}
					>
						Place Order
					</Button>
				</div>
			</div>
		</div>
	);
};

export default PosView;

export const POSViewLoading = () => {
	return (
		<div className="flex h-[calc(100vh-57px)] gap-4 overflow-hidden bg-muted p-4">
			{/* Left skeleton */}
			<div className="flex min-h-0 flex-1 flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
				{/* Search + filter + count inline row */}
				<div className="flex items-center gap-3">
					<Skeleton className="h-9 flex-1 rounded-full" />
					<Skeleton className="h-9 w-36 rounded-full" />
					<Skeleton className="h-4 w-16 rounded" />
				</div>

				{/* Product grid */}
				<div className="flex-1 overflow-hidden">
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
						{Array.from({ length: 10 }).map((_, i) => (
							<div
								key={i}
								className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white"
							>
								<Skeleton className="h-40 w-full rounded-none" />
								<div className="flex flex-col gap-2 p-3">
									<Skeleton className="h-4 w-3/4 rounded" />
									<Skeleton className="h-3 w-1/2 rounded" />
									<Skeleton className="mt-1 h-4 w-1/3 rounded" />
									<Skeleton className="mt-1 h-8 w-full rounded-xl" />
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Right cart skeleton */}
			<div className="flex w-[320px] shrink-0 flex-col overflow-hidden rounded-2xl bg-gray-900 shadow-lg">
				{/* Header */}
				<div className="flex items-center gap-2 border-b border-white/10 px-5 py-4">
					<Skeleton className="h-5 w-5 rounded bg-white/10" />
					<Skeleton className="h-4 w-32 rounded bg-white/10" />
				</div>

				{/* Items */}
				<div className="flex flex-1 flex-col gap-3 px-4 py-3">
					{Array.from({ length: 4 }).map((_, i) => (
						<div key={i} className="flex gap-3 rounded-xl p-3">
							<Skeleton className="h-[52px] w-[52px] shrink-0 rounded-lg bg-white/10" />
							<div className="flex flex-1 flex-col gap-2">
								<Skeleton className="h-3 w-3/4 rounded bg-white/10" />
								<Skeleton className="h-3 w-1/2 rounded bg-white/10" />
								<Skeleton className="h-5 w-24 rounded bg-white/10" />
							</div>
						</div>
					))}
				</div>

				{/* Payment summary */}
				<div className="flex flex-col gap-3 border-t border-white/10 bg-black/20 px-5 py-4">
					<Skeleton className="h-3 w-28 rounded bg-white/10" />
					<Skeleton className="h-3 w-full rounded bg-white/10" />
					<Skeleton className="h-3 w-full rounded bg-white/10" />
					<Skeleton className="h-px w-full bg-white/10" />
					<Skeleton className="h-5 w-full rounded bg-white/10" />
					<Skeleton className="h-10 w-full rounded-xl bg-green-900" />
				</div>
			</div>
		</div>
	);
};

export const POSViewError = () => {
	return <ErrorState title="Error loading POS" description="Please try again later." />;
};
