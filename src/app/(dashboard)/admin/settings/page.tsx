import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import CompanySettingsView from '@/modules/company/ui/views/company-settings-view';
import { CompanySettingsViewLoading } from '@/modules/company/ui/views/company-settings-view-loading';
import { getQueryClient, trpc } from '@/trpc/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';

const AdminSettingsPage = async () => {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session || session.user.role !== 'admin') redirect('/');

	const queryClient = getQueryClient();
	void queryClient.prefetchQuery(trpc.company.get.queryOptions());

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<Suspense fallback={<CompanySettingsViewLoading />}>
				<CompanySettingsView />
			</Suspense>
		</HydrationBoundary>
	);
};

export default AdminSettingsPage;
