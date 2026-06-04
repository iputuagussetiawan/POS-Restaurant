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

	if (session.user.role === 'cashier') {
		redirect('/pos');
	}

	return (
		<SidebarProvider>
			<DashboardSidebar />
			<main className="flex min-h-svh w-full flex-col bg-muted">
				<DashboardNavbar />
				{children}
				<footer className="mt-auto border-t bg-background px-4 py-3 md:px-8">
					<p className="text-xs text-muted-foreground">
						© {new Date().getFullYear()} Food Order. All rights reserved.
					</p>
				</footer>
			</main>
		</SidebarProvider>
	);
};

export default Layout;
