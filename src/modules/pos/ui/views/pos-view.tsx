'use client';
import React from 'react';

import Image from 'next/image';
import { MinusIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import ProductSearch from '@/modules/pos/ui/components/product-search';
import CategoryList from '@/modules/pos/ui/components/category-list';
import ProductList from '@/modules/pos/ui/components/product-list';
import DataPagination from '@/components/data-pagination';
import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { usePOSFilters } from '../../hooks/use-pos-filter';
import EmptyState from '@/components/empty-state';
import LoadingState from '@/components/loading-state';
import ErrorState from '@/components/error-state';
import { useCartStore } from '@/modules/pos/store/use-cart-store';
import { ScrollArea } from '@/components/ui/scroll-area';

const TAX_RATE = 0.1;

function formatIDR(amount: number) {
	return new Intl.NumberFormat('id-ID', {
		style: 'currency',
		currency: 'IDR',
		minimumFractionDigits: 0,
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

	return (
		<div>
			<main className="flex flex-col bg-muted p-4">
				<div className="min-h-screen rounded-2xl bg-white">
					<div className="grid grid-cols-[75%_25%]">
						{/* Left: product browser */}
						<div className="flex-1 space-y-8 p-8">
							<ProductSearch />
							<CategoryList />
							<ProductList data={data.items} />
							{data.items.length !== 0 && (
								<DataPagination
									page={filters.page}
									totalPages={data.totalPages}
									onPageChange={(page) => setFilters({ page })}
								/>
							)}
							{data.items.length === 0 && (
								<EmptyState
									title="Data Not Found"
									description="product not found"
								/>
							)}
						</div>

						{/* Right: cart */}
						<div className="relative flex min-h-screen flex-col rounded-tr-2xl rounded-br-2xl bg-sidebar">
							<div className="flex items-center justify-between p-4">
								<h3 className="text-xl text-white">Current Order</h3>
								{items.length > 0 && (
									<Button
										variant="ghost"
										size="sm"
										onClick={clearCart}
										className="text-xs text-red-400 hover:text-red-300"
									>
										Clear all
									</Button>
								)}
							</div>

							<ScrollArea className="flex-1 px-4">
								{items.length === 0 && (
									<p className="py-8 text-center text-sm text-muted-foreground">
										No items yet
									</p>
								)}
								<div className="flex flex-col space-y-3">
									{items.map(({ product, quantity }) => (
										<div
											key={product.id}
											className="flex gap-2 rounded-md bg-white p-2"
										>
											<Image
												className="rounded-md object-cover"
												src={product.imageUrl}
												alt={product.name}
												width={64}
												height={64}
											/>
											<div className="flex flex-1 flex-col justify-between">
												<p className="text-sm leading-tight font-semibold">
													{product.name}
												</p>
												<p className="text-xs font-semibold text-green-600">
													{formatIDR(Number(product.price))}
												</p>
												<div className="flex items-center gap-2">
													<Button
														variant="outline"
														size="icon"
														className="h-5 w-5"
														onClick={() =>
															updateQuantity(product.id, quantity - 1)
														}
													>
														<MinusIcon className="h-3 w-3" />
													</Button>
													<span className="font-mono text-xs">
														{quantity}
													</span>
													<Button
														variant="outline"
														size="icon"
														className="h-5 w-5"
														onClick={() =>
															updateQuantity(product.id, quantity + 1)
														}
													>
														<PlusIcon className="h-3 w-3" />
													</Button>
												</div>
											</div>
											<Button
												variant="ghost"
												size="icon"
												className="self-start"
												onClick={() => removeItem(product.id)}
											>
												<TrashIcon className="h-4 w-4 text-red-500" />
											</Button>
										</div>
									))}
								</div>
							</ScrollArea>

							{/* Payment summary */}
							<div className="p-4 text-white">
								<h3 className="mb-4 text-xl">Payment Summary</h3>
								<div className="space-y-2">
									<div className="flex justify-between">
										<span className="text-sm text-muted-foreground">
											Subtotal
										</span>
										<span className="text-right text-sm font-semibold text-muted-foreground">
											{formatIDR(subtotal)}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-sm text-muted-foreground">
											Tax (10%)
										</span>
										<span className="text-right text-sm font-semibold text-muted-foreground">
											{formatIDR(tax)}
										</span>
									</div>
								</div>
								<div className="py-4">
									<Separator className="opacity-10" />
								</div>
								<div className="flex justify-between">
									<span className="text-sm font-bold text-white">Total</span>
									<span className="text-right text-sm font-bold text-green-400">
										{formatIDR(total)}
									</span>
								</div>
								<Button
									className="mt-4 w-full bg-green-600 text-white hover:bg-green-700"
									disabled={items.length === 0}
								>
									Place Order
								</Button>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
};

export default PosView;

export const POSViewLoading = () => {
	return <LoadingState title="Loading Pos" description="Please wait..." />;
};

export const POSViewError = () => {
	return <ErrorState title="Error loading POS" description="Please try again later." />;
};
