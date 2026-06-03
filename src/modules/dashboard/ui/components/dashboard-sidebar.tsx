'use client';
import { Separator } from '@/components/ui/separator';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { BoxIcon, TagIcon, UsersIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import DashboardUserButton from './dashboard-user-button';
import { authClient } from '@/lib/auth-client';

const mainSection = [
	{
		icon: BoxIcon,
		label: 'Products',
		href: '/admin/products',
	},
	{
		icon: TagIcon,
		label: 'Product Categories',
		href: '/admin/categories',
	},
];

const adminSection = [
	{
		icon: UsersIcon,
		label: 'User Management',
		href: '/admin/users',
	},
];

const DashboardSidebar = () => {
	const pathname = usePathname();
	const { data: session } = authClient.useSession();
	const isAdmin = session?.user?.role === 'admin';

	return (
		<Sidebar>
			<SidebarHeader className="text-sidebar-accent-foreground">
				<Link href="/" className="flex items-center gap-2 px-2 pt-2">
					<Image src="/logo.svg" alt="Food Order" width={36} height={36} />
					<p className="text-2xl font-semibold">Food Order</p>
				</Link>
			</SidebarHeader>
			<div className="px-4 py-2">
				<Separator className="text-[#5d6b68] opacity-10" />
			</div>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{mainSection.map((item, index) => (
								<SidebarMenuItem key={index}>
									<SidebarMenuButton
										asChild
										className={cn(
											'h-10 border border-transparent from-sidebar-accent from-5% via-sidebar/50 via-30% to-sidebar/50 hover:border-[#5D6B69]/10 hover:bg-linear-to-r/oklch',
											pathname === item.href &&
												'border-[#5D6B68]/10 bg-linear-to-r/oklch'
										)}
										isActive={pathname === item.href}
									>
										<Link href={item.href}>
											<item.icon className="mr-2 size-5" />
											<span className="text-sm font-medium tracking-tight">
												{item.label}
											</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				{isAdmin && (
					<>
						<div className="px-4 py-2">
							<Separator className="text-[#5d6b68] opacity-10" />
						</div>
						<SidebarGroup>
							<SidebarGroupContent>
								<SidebarMenu>
									{adminSection.map((item, index) => (
										<SidebarMenuItem key={index}>
											<SidebarMenuButton
												asChild
												className={cn(
													'h-10 border border-transparent from-sidebar-accent from-5% via-sidebar/50 via-30% to-sidebar/50 hover:border-[#5D6B69]/10 hover:bg-linear-to-r/oklch',
													pathname === item.href &&
														'border-[#5D6B68]/10 bg-linear-to-r/oklch'
												)}
												isActive={pathname === item.href}
											>
												<Link href={item.href}>
													<item.icon className="mr-2 size-5" />
													<span className="text-sm font-medium tracking-tight">
														{item.label}
													</span>
												</Link>
											</SidebarMenuButton>
										</SidebarMenuItem>
									))}
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>
					</>
				)}
			</SidebarContent>
			<SidebarFooter className="text-white">
				<DashboardUserButton />
			</SidebarFooter>
		</Sidebar>
	);
};

export default DashboardSidebar;
