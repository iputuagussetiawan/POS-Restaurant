'use client';

import Link from 'next/link';
import { UtensilsCrossed, ShoppingBagIcon } from 'lucide-react';
import MenuProfile from '@/modules/pos/ui/components/menu-profile';
import { authClient } from '@/lib/auth-client';
import ShopSearch from './shop-search';
import { useCartStore } from '@/modules/pos/store/use-cart-store';
import { useShopCurrency } from '../../hooks/use-shop-currency';

interface ShopHeaderProps {
	onCartOpen: () => void;
}

const ShopHeader = ({ onCartOpen }: ShopHeaderProps) => {
	const { data: session } = authClient.useSession();
	const { format } = useShopCurrency();
	const items = useCartStore((s) => s.items);

	const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);
	const subtotal = items.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0);

	return (
		<nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 px-4 backdrop-blur-md md:px-6">
			<div className="mx-auto flex h-14 max-w-7xl items-center gap-3">
				{/* Logo */}
				<Link href="/" className="group flex shrink-0 items-center gap-2">
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-700 transition-transform duration-200 group-hover:scale-105">
						<UtensilsCrossed className="h-4 w-4 text-white" />
					</div>
					<span className="hidden text-base font-bold tracking-tight text-gray-900 sm:block">
						Food<span className="text-green-700">Order</span>
					</span>
				</Link>

				{/* Search */}
				<div className="flex-1">
					<ShopSearch />
				</div>

				{/* Cart button */}
				<button
					onClick={onCartOpen}
					className="relative flex shrink-0 items-center gap-2 rounded-xl bg-green-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700 active:scale-95"
				>
					<ShoppingBagIcon className="h-4 w-4" />
					<span className="hidden sm:inline">Cart</span>
					{totalQty > 0 && (
						<>
							<span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white px-1 text-[11px] font-bold text-green-700">
								{totalQty}
							</span>
							<span className="hidden border-l border-green-500 pl-2 text-xs text-green-100 md:inline">
								{format(subtotal)}
							</span>
						</>
					)}
				</button>

				{/* Auth */}
				<div className="shrink-0">
					{session ? (
						<MenuProfile />
					) : (
						<Link
							href="/sign-in"
							className="rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
						>
							Sign in
						</Link>
					)}
				</div>
			</div>
		</nav>
	);
};

export default ShopHeader;
