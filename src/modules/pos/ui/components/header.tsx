'use client';
import {
	CircleDollarSign,
	HistoryIcon,
	LayoutDashboardIcon,
	ListIcon,
	UtensilsCrossed,
	ShoppingBagIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import MenuProfile from './menu-profile';
import { cn } from '@/lib/utils';
import { authClient } from '@/lib/auth-client';

const cashierMenu = [
	{ icon: LayoutDashboardIcon, label: 'POS', href: '/pos' },
	{ icon: ListIcon, label: 'Order List', href: '/order-list' },
	{ icon: HistoryIcon, label: 'My History', href: '/cashier-history' },
	{ icon: CircleDollarSign, label: 'Bill', href: '/bill' },
];

const kitchenMenu = [
	{ icon: UtensilsCrossed, label: 'Kitchen', href: '/kitchen' },
	{ icon: ListIcon, label: 'Order List', href: '/order-list' },
];

const memberMenu = [{ icon: ShoppingBagIcon, label: 'Shop', href: '/shop' }];

const HeaderPOS = () => {
	const pathname = usePathname();
	const { data: session } = authClient.useSession();
	const role = session?.user?.role;
	const mainMenu =
		role === 'kitchen' ? kitchenMenu : role === 'member' ? memberMenu : cashierMenu;
	return (
		<nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 px-6 backdrop-blur-md">
			<div className="flex h-14 items-center justify-between gap-4">
				{/* Logo */}
				<Link href="/" className="group flex shrink-0 items-center gap-2.5">
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-700 transition-transform duration-200 group-hover:scale-105">
						<UtensilsCrossed className="h-4 w-4 text-white" />
					</div>
					<span className="text-lg font-bold tracking-tight text-gray-900">
						Food<span className="text-green-700">Order</span>
					</span>
				</Link>

				{/* Nav items */}
				<div className="flex items-center gap-1">
					{mainMenu.map((item) => {
						const isActive = pathname === item.href;
						return (
							<Link
								key={item.href}
								href={item.href}
								className={cn(
									'relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200',
									isActive
										? 'bg-green-700 text-white shadow-sm'
										: 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
								)}
							>
								<item.icon className="h-4 w-4 shrink-0" />
								<span>{item.label}</span>

								{/* active underline dot */}
								{isActive && (
									<span className="absolute -bottom-[1px] left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-green-400" />
								)}
							</Link>
						);
					})}
				</div>

				{/* Profile */}
				<div className="shrink-0">
					<MenuProfile />
				</div>
			</div>
		</nav>
	);
};

export default HeaderPOS;
