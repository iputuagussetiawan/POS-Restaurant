'use client';
import { CircleDollarSign, HistoryIcon, LayoutDashboardIcon, ListIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import MenuProfile from './menu-profile';
import Image from 'next/image';

const mainMenu = [
	{
		icon: LayoutDashboardIcon,
		label: 'Dashboard',
		href: '/pos/dashboard',
	},
	{
		icon: ListIcon,
		label: 'Order List',
		href: '/pos/order-list',
	},

	{
		icon: HistoryIcon,
		label: 'History',
		href: '/pos/history',
	},

	{
		icon: CircleDollarSign,
		label: 'Bill',
		href: '/pos/bill',
	},
];

const HeaderPOS = () => {
	const pathname = usePathname();
	return (
		<nav className="flex items-center justify-between gap-x-2 border-b bg-background px-4 py-2">
			<Link href="/" className="flex items-center gap-2 px-2">
				<Image src="/logo.svg" alt="Meet.AI" width={36} height={36} />
				<p className="text-2xl font-semibold">Food Order</p>
			</Link>
			<div className="main-menu">
				<div className="flex gap-x-4">
					{mainMenu.map((item, index) => (
						<Link
							key={index}
							className="flex items-center text-sm gap-x-2 rounded-full bg-gray-100 px-6 py-2 text-gray-700 transition-all hover:bg-green-800 hover:text-white"
							href={item.href}
						>
							<item.icon className="size-4" />
							{item.label}
						</Link>
					))}
				</div>
			</div>
			<div className="main-menu">
				<MenuProfile />
			</div>
		</nav>
	);
};

export default HeaderPOS;
