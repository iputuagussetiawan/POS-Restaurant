import React from 'react';
import HeaderPOS from '../_components/header';
import FooterPOS from '../_components/footer';
import CategoryList from '../_components/category-list';
import ProductList from '../_components/product-list';
import ProductSearch from '../_components/product-search';
import Image from 'next/image';
import { TrashIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const POSPage = () => {
	return (
		<div>
			<HeaderPOS />
			<main className="flex flex-col bg-muted p-4">
				<div className="min-h-screen rounded-2xl bg-white">
					<div className="grid grid-cols-[75%_25%]">
						<div className="flex-1 p-8 space-y-8">
							<ProductSearch />
							<CategoryList />
							<ProductList />
						</div>
						<div className="relative flex min-h-screen flex-col justify-between rounded-tr-2xl rounded-br-2xl bg-sidebar p-4">
							<div className="flex-1">
								<h3 className="mb-5 text-xl text-white">Current Order</h3>
								<div className="flex flex-col space-y-4">
									<div className="flex gap-2 rounded-md bg-white p-1">
										<div>
											<Image
												className="rounded-md"
												src={'/images/Pizza-3007395.jpg'}
												alt="category"
												width={120}
												height={120}
											/>
										</div>
										<div className="relative flex flex-1 justify-between">
											<div className="flex-1">
												<h4 className="font-semibold">Pizza Meat Lover</h4>
												<p className="text-sm font-semibold text-green-600">
													Rp1.500.000
													<span>
														<span className="font-mono text-xs text-muted-foreground">
															{' '}
															x 1
														</span>
													</span>
												</p>
											</div>
											<Button
												variant="ghost"
												className="absolute bottom-0 right-0"
											>
												<TrashIcon className="text-red-600" />
											</Button>
										</div>
									</div>
									
								</div>
							</div>

							<div className="relative right-0 bottom-0 left-0 justify-self-end p-4 text-white">
								<h3 className="text-xl mb-4">Payment Summary</h3>
								<div className="space-y-2">
									<div className="flex justify-between">
										<span className="text-sm text-muted-foreground">
											Subtotal
										</span>
										<span className="text-right text-sm font-semibold text-muted-foreground">
											Rp1.500.000
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-sm text-muted-foreground">
											Discount sales
										</span>
										<span className="text-right text-sm font-semibold text-muted-foreground">
											-Rp200.000
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-sm text-muted-foreground">
											Total Tax
										</span>
										<span className="text-right text-sm font-semibold text-muted-foreground">
											Rp100.000
										</span>
									</div>
								</div>
								<div className="py-4">
									<Separator className="text-[#5d6b68] opacity-10" />
								</div>
								<div className="flex justify-between">
									<span className="text-sm font-bold text-white">Total</span>
									<span className="text-right text-sm font-bold text-green-500">
										Rp1.200.000
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
			<FooterPOS />
		</div>
	);
};

export default POSPage;
