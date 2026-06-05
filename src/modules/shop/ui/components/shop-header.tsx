'use client';

import Link from 'next/link';
import { UtensilsCrossed } from 'lucide-react';
import MenuProfile from '@/modules/pos/ui/components/menu-profile';
import { authClient } from '@/lib/auth-client';

const ShopHeader = () => {
	const { data: session } = authClient.useSession();

	return (
		<nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 px-6 backdrop-blur-md">
			<div className="flex h-14 items-center justify-between gap-4">
				<Link href="/" className="group flex shrink-0 items-center gap-2.5">
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-700 transition-transform duration-200 group-hover:scale-105">
						<UtensilsCrossed className="h-4 w-4 text-white" />
					</div>
					<span className="text-lg font-bold tracking-tight text-gray-900">
						Food<span className="text-green-700">Order</span>
					</span>
				</Link>

				<div className="shrink-0">
					{session ? (
						<MenuProfile />
					) : (
						<Link
							href="/sign-in"
							className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
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
