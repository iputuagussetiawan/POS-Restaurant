import { auth } from '@/lib/auth';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardNavbar from '@/modules/dashboard/ui/components/dashboard-navbar';
import DashboardSidebar from '@/modules/dashboard/ui/components/dashboard-sidebar';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react';

interface Props {
	children: React.ReactNode;
}

const ALLOWED_ROLES = ['admin', 'manager', 'cashier'];

const Layout = async ({ children }: Props) => {
	const session = await auth.api.getSession({ headers: await headers() });

	if (!session) {
		redirect('/sign-in');
	}

	if (!session.user.role || !ALLOWED_ROLES.includes(session.user.role)) {
		redirect('/pending');
	}

	return (
		<SidebarProvider>
			<DashboardSidebar />
			<main className="flex h-screen w-screen flex-col bg-muted">
				<DashboardNavbar />
				{children}
			</main>
		</SidebarProvider>
	);
};

export default Layout;
