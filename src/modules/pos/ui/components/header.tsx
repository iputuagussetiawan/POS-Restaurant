'use client';
import {
	CircleDollarSign,
	HistoryIcon,
	LayoutDashboardIcon,
	ListIcon,
	UtensilsCrossed,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import MenuProfile from './menu-profile';
import { cn } from '@/lib/utils';

const mainMenu = [
	{ icon: LayoutDashboardIcon, label: 'Dashboard', href: '/pos/dashboard' },
	{ icon: ListIcon, label: 'Order List', href: '/pos/order-list' },
	{ icon: HistoryIcon, label: 'History', href: '/pos/history' },
	{ icon: CircleDollarSign, label: 'Bill', href: '/pos/bill' },
];

const HeaderPOS = () => {
	const pathname = usePathname();
	return (
		<nav className="sticky top-0 z-50 flex items-center justify-between gap-x-2 border-b bg-white px-6 py-3 shadow-sm">
			<Link href="/" className="flex items-center gap-2">
				<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-700">
					<UtensilsCrossed className="h-5 w-5 text-white" />
				</div>
				<p className="text-xl font-bold tracking-tight text-gray-800">
					Food<span className="text-green-700">Order</span>
				</p>
			</Link>

			<div className="flex gap-x-1">
				{mainMenu.map((item) => {
					const isActive = pathname === item.href;
					return (
						<Link
							key={item.href}
							href={item.href}
							className={cn(
								'flex items-center gap-x-2 rounded-full px-5 py-2 text-sm font-medium transition-all',
								isActive
									? 'bg-green-700 text-white shadow'
									: 'bg-gray-100 text-gray-600 hover:bg-green-700 hover:text-white'
							)}
						>
							<item.icon className="size-4" />
							{item.label}
						</Link>
					);
				})}
			</div>

			<MenuProfile />
		</nav>
	);
};

export default HeaderPOS;
